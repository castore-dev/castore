export class EventStoreReduxStateNotFoundError extends Error {
  eventStoreSliceName: string;

  constructor({ eventStoreSliceName }: { eventStoreSliceName: string }) {
    super(`Unable to find redux slice at path ${eventStoreSliceName}`);

    this.eventStoreSliceName = eventStoreSliceName;
  }
}
