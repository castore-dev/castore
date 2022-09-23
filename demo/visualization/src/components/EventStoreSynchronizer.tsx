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
      getEvents: (aggregateId, { maxVersion } = {}) =>
        new Promise(resolve => {
          let events = eventsByAggregateId[aggregateId] ?? [];

          if (maxVersion !== undefined) {
            events = events.filter(({ version }) => version <= maxVersion);
          }

          resolve({ events });
        }),
      pushEvent: (nextEvent: EventDetail) =>
        new Promise(resolve => {
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

          resolve();
        }),
      listAggregateIds: () =>
        new Promise(resolve =>
          resolve({ aggregateIds: Object.keys(eventsByAggregateId) }),
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
