import { Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';

import type { EventDetail, EventStore } from '@castore/core';

import { eventStoresById } from '~/services/data';

import { AggregateCard } from './AggregateCard';

type DB = Record<string, EventDetail[]>;

export const EventStoreDB = ({
  eventStore,
}: {
  eventStore: EventStore;
}): JSX.Element => {
  const { eventStoreId } = eventStore;
  const { listAggregateIds, getEvents } = eventStoresById[eventStoreId];
  const [db, setDb] = useState<DB>({});

  useEffect(() => {
    const getDb = async () => {
      const { aggregateIds } = await listAggregateIds();

      const $db: DB = {};

      await Promise.all(
        aggregateIds.map(async aggregateId => {
          const { events } = await getEvents(aggregateId);
          $db[aggregateId] = events;
        }),
      );

      setDb($db);
    };
    void getDb();
  }, [listAggregateIds, getEvents]);

  return (
    <Stack spacing={2}>
      {Object.entries(db)
        .sort(([, eventsA], [, eventsB]) =>
          eventsA[0].timestamp < eventsB[0].timestamp ? -1 : 1,
        )
        .map(([aggregateId, events]) => (
          <AggregateCard
            key={aggregateId}
            aggregateId={aggregateId}
            events={events}
            eventStore={eventStore}
          />
        ))}
    </Stack>
  );
};
