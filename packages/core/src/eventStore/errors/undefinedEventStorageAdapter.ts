export class UndefinedEventStorageAdapterError extends Error {
  eventStoreId: string;

  constructor({ eventStoreId }: { eventStoreId: string }) {
    super(`EventStorageAdapter not found for event store ${eventStoreId}`);

    this.eventStoreId = eventStoreId;
  }
}
