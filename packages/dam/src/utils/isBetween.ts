import type { EventDetail } from '@castore/core';

export const isBetween = (
  { timestamp }: EventDetail,
  { from, to }: { from?: string; to?: string },
): boolean =>
  (from === undefined || timestamp >= from) &&
  (to === undefined || timestamp <= to);

export const getIsBetween =
  ({ from, to }: { from?: string; to?: string }) =>
  (event: EventDetail): boolean =>
    isBetween(event, { from, to });
