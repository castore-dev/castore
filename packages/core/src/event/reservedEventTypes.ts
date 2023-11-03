export const __REPLAYED__ = '__REPLAYED__';
export type __REPLAYED__ = typeof __REPLAYED__;

export const __AGGREGATE_EXISTS__ = '__AGGREGATE_EXISTS__';
export type __AGGREGATE_EXISTS__ = typeof __AGGREGATE_EXISTS__;

export const reservedEventTypes = new Set<string>([
  __REPLAYED__,
  __AGGREGATE_EXISTS__,
]);
