/**
 * @name EventAlreadyExistsError
 * @description Error thrown when an event already exists
 */
export class EventAlreadyExistsError extends Error {
  eventStoreId?: string;
  aggregateId: string;
  version: number;

  constructor({
    eventStoreId,
    aggregateId,
    version,
  }: {
    eventStoreId?: string;
    aggregateId: string;
    version: number;
  }) {
    super(
      `Event already exists for ${
        eventStoreId ?? ''
      } aggregate ${aggregateId} and version ${version}`,
    );

    this.aggregateId = aggregateId;
    this.version = version;
  }
}
