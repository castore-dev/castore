import React, { useEffect } from 'react';

import { EventAlreadyExistsError, EventDetail } from '@castore/core';

import { dbByEventStoreId, eventStoresById } from '~/services/data';

export const EventStoreSynchronizer = ({
  eventStoreId,
}: {
  eventStoreId: string;
}): JSX.Element => {
  const [eventsByAggregateId, setEventsByAggregateId] =
    dbByEventStoreId[eventStoreId]();

  useEffect(() => {
    const eventStore = eventStoresById[eventStoreId];

    delete eventStore.storageAdapter;

    // /!\ WARNING /!\ This update do not trigger a re-render
    // This is not an issue right now, but may become one in the future
    // To replace by a state in this case
    eventStore.storageAdapter = {
      // eslint-disable-next-line @typescript-eslint/require-await
      getEvents: async (aggregateId, { maxVersion } = {}) => {
        let events = eventsByAggregateId[aggregateId] ?? [];

        if (maxVersion !== undefined) {
          events = events.filter(({ version }) => version <= maxVersion);
        }

        return { events };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      pushEvent: async (nextEvent: EventDetail) => {
        const { aggregateId, version: nextVersion } = nextEvent;

        setEventsByAggregateId(prevEventsByAggregateId => {
          const prevEvents = prevEventsByAggregateId[aggregateId] ?? [];

          if (
            prevEvents.some(
              ({ version: prevVersion }) => prevVersion === nextVersion,
            )
          ) {
            throw new EventAlreadyExistsError({
              eventStoreId,
              aggregateId,
              version: nextVersion,
            });
          }

          return {
            ...prevEventsByAggregateId,
            [aggregateId]: [...prevEvents, nextEvent],
          };
        });
      },
      listAggregateIds: () =>
        new Promise(resolve =>
          resolve({
            aggregateIds: Object.keys(eventsByAggregateId),
          }),
        ),
      // We do not implement snapshots in this adapter
      putSnapshot: () => new Promise(resolve => resolve()),
      getLastSnapshot: () =>
        new Promise(resolve => resolve({ snapshot: undefined })),
      listSnapshots: () => new Promise(resolve => resolve({ snapshots: [] })),
    };
  }, [eventsByAggregateId, setEventsByAggregateId]);

  return <></>;
};
