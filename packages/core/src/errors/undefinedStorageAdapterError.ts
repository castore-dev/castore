/**
 * @name UndefinedStorageAdapterError
 * @description Error thrown when the storage adapter is undefined
 */
export class UndefinedStorageAdapterError extends Error {
  eventStoreId: string;

  constructor({ eventStoreId }: { eventStoreId: string }) {
    super(`Storage Adapter undefined for event store ${eventStoreId} `);

    this.eventStoreId = eventStoreId;
  }
}
