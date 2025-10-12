import { Aggregate } from '~/aggregate';
import {
  cleanUpLastSnapshot,
  createShouldSaveForRecurentSnapshots,
} from '~/snapshot/defaultSnapshotConfig';
import { SnapshotStorageAdapter } from '~/snapshot/snapshotStorageAdapter';

describe('Default Snapshot Config', () => {
  const aggregateId = 'aggregateId';
  describe('createShouldSaveForRecurentSnapshots', () => {
    it('return false if aggregate is not defined', () => {
      expect(
        createShouldSaveForRecurentSnapshots(0)({
          aggregate: undefined,
        }),
      ).toBe(false);
    });

    it.each`
      aggregateVersion | versionGap | shouldSaveSnapshot
      ${1}             | ${2}       | ${false}
      ${2}             | ${2}       | ${true}
      ${3}             | ${2}       | ${false}
      ${4}             | ${2}       | ${true}
      ${1}             | ${10}      | ${false}
      ${9}             | ${10}      | ${false}
      ${10}            | ${10}      | ${true}
      ${11}            | ${10}      | ${false}
      ${20}            | ${10}      | ${true}
      ${100}           | ${10}      | ${true}
      ${1}             | ${15}      | ${false}
      ${14}            | ${15}      | ${false}
      ${15}            | ${15}      | ${true}
      ${16}            | ${15}      | ${false}
      ${30}            | ${15}      | ${true}
      ${90}            | ${15}      | ${true}
    `(
      'returns $shouldSaveSnapshot if aggregate version is $aggregateVersion for versionGap = $versionGap',
      ({
        aggregateVersion,
        versionGap,
        shouldSaveSnapshot,
      }: {
        aggregateVersion: number;
        versionGap: number;
        shouldSaveSnapshot: boolean;
      }) => {
        expect(
          createShouldSaveForRecurentSnapshots(versionGap)({
            aggregate: { version: aggregateVersion, aggregateId },
          }),
        ).toBe(shouldSaveSnapshot);
      },
    );
  });
  describe('cleanUpLastSnapshot', () => {
    const deleteSnapshot = vi.fn();
    const snapshotStorageAdapter = {
      deleteSnapshot,
    } as unknown as SnapshotStorageAdapter<Aggregate, Aggregate>;

    const latestSnapshot = {
      aggregate: {
        aggregateId: 'aggregateId',
        version: 20,
      },
      reducerVersion: 'v1',
      eventStoreId: 'eventStoreId',
    };

    const previousSnapshot = {
      aggregate: {
        aggregateId: 'aggregateId',
        version: 10,
      },
      reducerVersion: 'v1',
      eventStoreId: 'eventStoreId',
    };

    it('does nothing if previous snapshot if undefined', async () => {
      await cleanUpLastSnapshot({ latestSnapshot, snapshotStorageAdapter });

      expect(deleteSnapshot).not.toHaveBeenCalled();
    });

    it('delete the previous snapshot if defined', async () => {
      await cleanUpLastSnapshot({
        latestSnapshot,
        previousSnapshot,
        snapshotStorageAdapter,
      });

      expect(deleteSnapshot).toHaveBeenCalledWith({
        aggregateId: 'aggregateId',
        aggregateVersion: 10,
        reducerVersion: 'v1',
        eventStoreId: 'eventStoreId',
      });
    });
  });
});
