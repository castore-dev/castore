import { Aggregate } from '~/aggregate';

import { Snapshot, SnapshotStorageAdapter } from './snapshotStorageAdapter';

export const createShouldSaveForRecurentSnapshots =
  (versionGap: number) =>
  <AGGREGATE extends Aggregate>({
    aggregate,
  }: {
    aggregate?: AGGREGATE;
  }): boolean => {
    if (aggregate === undefined) {
      return false;
    }
    if (aggregate.version % versionGap === 0) {
      return true;
    }

    return false;
  };

export const cleanUpLastSnapshot = async <AGGREGATE extends Aggregate>({
  previousSnapshot,
  snapshotStorageAdapter,
}: {
  latestSnapshot: Snapshot<AGGREGATE>;
  previousSnapshot?: Snapshot<AGGREGATE>;
  snapshotStorageAdapter: SnapshotStorageAdapter<AGGREGATE, AGGREGATE>;
}): Promise<void> => {
  if (previousSnapshot === undefined) {
    return;
  }

  return snapshotStorageAdapter.deleteSnapshot({
    aggregateId: previousSnapshot.aggregate.aggregateId,
    aggregateVersion: previousSnapshot.aggregate.version,
    eventStoreId: previousSnapshot.eventStoreId,
    reducerVersion: previousSnapshot.reducerVersion,
  });
};
