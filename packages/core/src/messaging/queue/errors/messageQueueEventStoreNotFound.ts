export class MessageQueueEventStoreNotFoundError extends Error {
  constructor({
    messageQueueId,
    eventStoreId,
  }: {
    messageQueueId: string;
    eventStoreId: string;
  }) {
    super(
      `Unable to find event store ${eventStoreId} in message queue ${messageQueueId}. Did you provide it in the constructor?`,
    );
  }
}
