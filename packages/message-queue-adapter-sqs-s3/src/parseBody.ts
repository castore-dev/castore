import type {
  AggregateExistsMessageQueue,
  NotificationMessageQueue,
  StateCarryingMessageQueue,
} from '@castore/core';
import type { SQSMessageQueueMessageBody } from '@castore/message-queue-adapter-sqs';

import type { OversizedEntryDetail } from './message';

export const parseBody = async <
  MESSAGE_QUEUE extends
    | AggregateExistsMessageQueue
    | NotificationMessageQueue
    | StateCarryingMessageQueue,
>(
  body: string,
  { fetch: _fetch = fetch }: { fetch?: typeof fetch } = { fetch },
): Promise<SQSMessageQueueMessageBody<MESSAGE_QUEUE>> => {
  const jsonParsedBody = JSON.parse(body) as Record<string, unknown> | null;

  if (
    typeof jsonParsedBody === 'object' &&
    jsonParsedBody !== null &&
    'messageUrl' in jsonParsedBody
  ) {
    const response = await _fetch(
      (jsonParsedBody as OversizedEntryDetail).messageUrl,
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const parsedBody =
      (await response.json()) as SQSMessageQueueMessageBody<MESSAGE_QUEUE>;

    return parsedBody;
  }

  return jsonParsedBody as SQSMessageQueueMessageBody<MESSAGE_QUEUE>;
};
