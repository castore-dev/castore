import { Aggregate } from '~/aggregate';

import { Snapshot, SnapshotStorageAdapter } from './snapshotStorageAdapter';

export interface SnapshotConfig<
  AGGREGATE extends Aggregate,
  $AGGREGATE extends Aggregate,
> {
  currentReducerVersion: string;

  shouldSaveSnapshot: (args: {
    aggregate?: $AGGREGATE;
    previousSnapshot?: Snapshot<$AGGREGATE>;
  }) => boolean;

  // Optional - if provided, this function will be called when a snapshot is loaded but its reducer version doesn't match the current reducer version
  // if not provided, the snapshot will be ignored and the aggregate will be rebuilt from events
  migrateSnapshotReducerVersion?: (
    snapshot: Snapshot<$AGGREGATE>,
  ) =>
    | Promise<Snapshot<AGGREGATE> | undefined>
    | Snapshot<AGGREGATE>
    | undefined;

  cleanUpAfterSnapshotSave?: (args: {
    latestSnapshot: Snapshot<$AGGREGATE>;
    previousSnapshot?: Snapshot<$AGGREGATE>;
    snapshotStorageAdapter: SnapshotStorageAdapter<$AGGREGATE, $AGGREGATE>;
  }) => Promise<void> | void;
}
