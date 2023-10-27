export interface ScannedAggregate {
  aggregateId: string;
  initialEventTimestamp: string;
}

export interface ScanInfos {
  firstScannedAggregate?: ScannedAggregate;
  lastScannedAggregate?: ScannedAggregate;
}
