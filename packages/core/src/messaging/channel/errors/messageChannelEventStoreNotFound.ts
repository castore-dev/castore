export class MessageChannelEventStoreNotFoundError extends Error {
  constructor({
    messageChannelType,
    messageChannelId,
    eventStoreId,
  }: {
    messageChannelType: string;
    messageChannelId: string;
    eventStoreId: string;
  }) {
    super(
      `Unable to find event store ${eventStoreId} in message ${messageChannelType} ${messageChannelId}. Did you provide it in the constructor?`,
    );
  }
}
