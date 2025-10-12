import { Aggregate } from '~/aggregate';

export type Snapshot<AGGREGATE extends Aggregate> = {
  aggregate: AGGREGATE;
  reducerVersion: string;
  eventStoreId: string;
};

export interface SnapshotStorageAdapter<
  AGGREGATE extends Aggregate = Aggregate,
  $AGGREGATE = Aggregate,
> {
  getSnapshot: ({
    aggregateId,
    eventStoreId,
    reducerVersion,
  }: {
    aggregateId: string;
    eventStoreId: string;
    aggregateMaxVersion?: number; // Optional - if provided, get the latest snapshot with a version bellow max version
    reducerVersion?: string; // Optional - if provided, get the latest snapshot build with this reducer version
  }) => Promise<Snapshot<AGGREGATE> | undefined>;

  saveSnapshot: ({
    aggregate,
    eventStoreId,
    reducerVersion,
  }: {
    aggregate: $AGGREGATE;
    reducerVersion: string;
    eventStoreId: string;
  }) => Promise<void>;

  deleteSnapshot: ({
    aggregateId,
    aggregateVersion,
    eventStoreId,
    reducerVersion,
  }: {
    aggregateId: string;
    aggregateVersion: number;
    eventStoreId: string;
    reducerVersion: string;
  }) => Promise<void>;
}
