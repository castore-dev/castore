export const DEFAULT_PREFIX = '@castore';

export const getEventStoreSliceName = ({
  prefix = DEFAULT_PREFIX,
  eventStoreId,
}: {
  prefix?: string;
  eventStoreId: string;
}): string => [prefix, eventStoreId].join('_');
