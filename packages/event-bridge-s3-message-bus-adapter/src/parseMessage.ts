import type { EventBridgeEvent } from 'aws-lambda';

import type { OversizedEntryDetail } from './message';

type ParsedMessage<MESSAGES extends EventBridgeEvent<string, unknown>> =
  MESSAGES extends infer MESSAGE
    ? MESSAGE extends EventBridgeEvent<string, unknown>
      ? {
          [KEY in keyof MESSAGE]: KEY extends 'detail'
            ? Exclude<MESSAGE[KEY], OversizedEntryDetail>
            : MESSAGE[KEY];
        }
      : never
    : never;

export const parseMessage = async <
  MESSAGES extends EventBridgeEvent<string, unknown>,
>(
  _message: MESSAGES,
  { fetch: _fetch = fetch }: { fetch?: typeof fetch } = { fetch },
): Promise<ParsedMessage<MESSAGES>> => {
  const message = _message as EventBridgeEvent<string, unknown>;
  const { detail: entry } = message;

  if (typeof entry === 'object' && entry !== null && 'messageUrl' in entry) {
    const response = await _fetch((entry as OversizedEntryDetail).messageUrl);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return {
      ...message,
      detail: await response.json(),
    } as ParsedMessage<MESSAGES>;
  }

  return message as ParsedMessage<MESSAGES>;
};
