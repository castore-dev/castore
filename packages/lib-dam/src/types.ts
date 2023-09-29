export interface ScannedAggregate {
  aggregateId: string;
  /**
   * @debt v2 "make listAggregateIds return initialEventTimestamp and return them here"
   */
  // initialEventTimestamp: number;
}

export interface ScanInfos {
  firstScannedAggregate?: ScannedAggregate;
  lastScannedAggregate?: ScannedAggregate;
}
