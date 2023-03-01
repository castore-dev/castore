export class UndefinedMessageQueueAdapterError extends Error {
  constructor({ messageQueueId }: { messageQueueId: string }) {
    super(`Storage Adapter undefined for event store ${messageQueueId}`);
  }
}
