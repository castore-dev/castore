export class EventStoreReduxStateNotFoundError extends Error {
  eventStoreId: string;

  constructor({ eventStoreId }: { eventStoreId: string }) {
    super(`Unable to find redux state for eventStoreId ${eventStoreId}`);

    this.eventStoreId = eventStoreId;
  }
}
