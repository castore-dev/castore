import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';

export const PUT_EVENTS_ENTRIES_SIZE_LIMIT = 262144;

export const getFormattedMessageSize = (
  formattedMessage: PutEventsRequestEntry,
): number => {
  let size = 0;

  if (formattedMessage.Time) {
    size += 14;
  }

  if (formattedMessage.Detail !== undefined) {
    size += Buffer.byteLength(formattedMessage.Detail, 'utf-8');
  }

  if (formattedMessage.DetailType !== undefined) {
    size += Buffer.byteLength(formattedMessage.DetailType, 'utf-8');
  }

  if (formattedMessage.Source !== undefined) {
    size += Buffer.byteLength(formattedMessage.Source, 'utf-8');
  }

  if (formattedMessage.Resources) {
    formattedMessage.Resources.forEach(resource => {
      size += Buffer.byteLength(resource, 'utf-8');
    });
  }

  return size;
};
