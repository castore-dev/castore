export type EventDetail = {
  aggregateId: string;
  version: number;
  type: string;
  timestamp: string;
  payload: Record<string, unknown>;
};
