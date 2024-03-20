import type { SendMessageRequest } from '@aws-sdk/client-sqs';

export const SEND_MESSAGES_SIZE_LIMIT = 262_144;

// TODO: Test
export const getMessageSize = (message: SendMessageRequest): number => {
  let size = 0;

  if (message.MessageBody !== undefined) {
    size += Buffer.byteLength(message.MessageBody, 'utf-8');
  }

  if (message.MessageAttributes !== undefined) {
    for (const [key, attribute] of Object.entries(message.MessageAttributes)) {
      size += Buffer.byteLength(key, 'utf-8');
      for (const attributeValue of Object.values(attribute)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        size += Buffer.byteLength(attributeValue, 'utf-8');
      }
    }
  }

  return size;
};
