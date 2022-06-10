export class UndefinedStorageAdapterError extends Error {
  eventStoreId: string;

  constructor({ eventStoreId }: { eventStoreId: string }) {
    super(`Storage Adapter undefined for event store ${eventStoreId} `);

    this.eventStoreId = eventStoreId;
  }
}
