import type { ScanInfos } from '~/types';

export const updateScanInfos = ({
  scanInfos,
  aggregateIds,
  areAllAggregatesScanned,
}: {
  scanInfos: ScanInfos;
  aggregateIds: string[];
  areAllAggregatesScanned: boolean;
}): void => {
  if (
    scanInfos.firstScannedAggregate === undefined &&
    aggregateIds[0] !== undefined
  ) {
    scanInfos.firstScannedAggregate = {
      aggregateId: aggregateIds[0],
    };
  }

  const lastScannedAggregateId = aggregateIds[aggregateIds.length - 1];

  if (areAllAggregatesScanned && lastScannedAggregateId !== undefined) {
    scanInfos.lastScannedAggregate = {
      aggregateId: lastScannedAggregateId,
    };
  }
};
