export class EventStoreNotFoundError extends Error {
  constructor({
    messageBusId,
    eventStoreId,
  }: {
    messageBusId: string;
    eventStoreId: string;
  }) {
    super(
      `Unable to find event store ${eventStoreId} in message bus ${messageBusId}. Did you provide it in the constructor?`,
    );
  }
}
