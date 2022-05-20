export type EventDetail = {
  aggregateId: string;
  version: number;
  type: string;
  timestamp: string;
  payload?: unknown;
  metadata?: unknown;
};
