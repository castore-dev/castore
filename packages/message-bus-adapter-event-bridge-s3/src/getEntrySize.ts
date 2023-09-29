import { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';

export const PUT_EVENTS_ENTRIES_SIZE_LIMIT = 262144;

export const getEntrySize = (entry: PutEventsRequestEntry): number => {
  let size = 0;

  if (entry.Time) {
    size += 14;
  }

  if (entry.Detail !== undefined) {
    size += Buffer.byteLength(entry.Detail, 'utf-8');
  }

  if (entry.DetailType !== undefined) {
    size += Buffer.byteLength(entry.DetailType, 'utf-8');
  }

  if (entry.Source !== undefined) {
    size += Buffer.byteLength(entry.Source, 'utf-8');
  }

  if (entry.Resources) {
    entry.Resources.forEach(resource => {
      size += Buffer.byteLength(resource, 'utf-8');
    });
  }

  return size;
};
