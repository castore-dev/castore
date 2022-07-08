import type { IHookStateSetAction } from 'react-use/lib/misc/hookState';

import type { EventDetail, EventStore } from '@castore/event-store';

export const dbByEventStoreId: Record<
  string,
  () => [
    Record<string, EventDetail[] | undefined>,
    (
      state: IHookStateSetAction<Record<string, EventDetail[] | undefined>>,
    ) => void,
  ]
> = {};

export const eventStoresById: Record<string, EventStore> = {};
