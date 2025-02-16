import type { EventAlreadyExistsError } from '@castore/core';
import { eventAlreadyExistsErrorCode } from '@castore/core';

export class PostgresEventAlreadyExistsError
  extends Error
  implements EventAlreadyExistsError
{
  code: typeof eventAlreadyExistsErrorCode;
  eventStoreId?: string;
  aggregateId: string;
  version: number;

  constructor({
    eventStoreId = '',
    aggregateId,
    version,
  }: {
    eventStoreId?: string;
    aggregateId: string;
    version: number;
  }) {
    super(
      `Event already exists for ${eventStoreId} aggregate ${aggregateId} and version ${version}`,
    );

    this.code = eventAlreadyExistsErrorCode;
    if (eventStoreId) {
      this.eventStoreId = eventStoreId;
    }
    this.aggregateId = aggregateId;
    this.version = version;
  }
}
