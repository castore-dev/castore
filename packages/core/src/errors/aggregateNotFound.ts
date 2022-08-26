/**
 * @name AggregateNotFoundError
 * @description Error thrown when an aggregate is not found
 */
export class AggregateNotFoundError extends Error {
  constructor({
    aggregateId,
    eventStoreId,
  }: {
    aggregateId: string;
    eventStoreId: string;
  }) {
    super(
      `Unable to find aggregate ${aggregateId} in event store ${eventStoreId}.`,
    );
  }
}
