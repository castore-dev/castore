import type { EventDetail } from '@castore/core';

export const getIsBetween =
  ({ from, to }: { from?: string; to?: string }) =>
  ({ timestamp }: EventDetail): boolean =>
    (from === undefined || timestamp >= from) &&
    (to === undefined || timestamp <= to);
