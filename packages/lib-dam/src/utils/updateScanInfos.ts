import type { ScanInfos } from '~/types';

export const updateScanInfos = ({
  scanInfos,
  aggregateIds,
  areAllAggregatesScanned,
}: {
  scanInfos: ScanInfos;
  aggregateIds: { aggregateId: string; initialEventTimestamp: string }[];
  areAllAggregatesScanned: boolean;
}): void => {
  if (
    scanInfos.firstScannedAggregate === undefined &&
    aggregateIds[0] !== undefined
  ) {
    const { aggregateId, initialEventTimestamp } = aggregateIds[0];
    scanInfos.firstScannedAggregate = {
      aggregateId,
      initialEventTimestamp,
    };
  }

  const lastScannedAggregate = aggregateIds[aggregateIds.length - 1];

  if (areAllAggregatesScanned && lastScannedAggregate !== undefined) {
    const { aggregateId, initialEventTimestamp } = lastScannedAggregate;
    scanInfos.lastScannedAggregate = {
      aggregateId,
      initialEventTimestamp,
    };
  }
};
