export class ReduxEventStorageAdapterNotFoundError extends Error {
  eventStoreId: string;

  constructor({ eventStoreId }: { eventStoreId: string }) {
    super(
      `Unable to find ReduxEventStorageAdapter for event store ${eventStoreId}`,
    );

    this.eventStoreId = eventStoreId;
  }
}
