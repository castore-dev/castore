import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

import { EventStore } from '@castore/core';

import { ReduxEventStorageAdapter } from '~/adapter';
import { getCastoreReducers } from '~/getCastoreReducers';
import { EventStoresReduxState } from '~/types';
import { DEFAULT_PREFIX } from '~/utils/getEventStoreSliceName';

export const configureCastore = <EVENT_STORES extends EventStore[]>({
  eventStores,
  prefix = DEFAULT_PREFIX,
}: {
  eventStores: EVENT_STORES;
  prefix?: string;
}): EnhancedStore<EventStoresReduxState<EVENT_STORES>> => {
  const castoreReducers = getCastoreReducers({ eventStores, prefix });

  const store = configureStore({ reducer: castoreReducers });

  eventStores.forEach(eventStore => {
    eventStore.storageAdapter = new ReduxEventStorageAdapter({
      store,
      eventStoreId: eventStore.eventStoreId,
      prefix,
    });
  });

  return store as EnhancedStore<EventStoresReduxState<EVENT_STORES>>;
};
