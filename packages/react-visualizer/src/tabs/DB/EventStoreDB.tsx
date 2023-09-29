import { Stack } from '@mui/material';
import React from 'react';

import type { EventStore } from '@castore/core';
import { useAggregateIds } from '@castore/event-storage-adapter-redux';

import { AggregateCard } from './AggregateCard';

export const EventStoreDB = ({
  eventStore,
}: {
  eventStore: EventStore;
}): JSX.Element => {
  const { aggregateIds } = useAggregateIds(eventStore);

  return (
    <Stack spacing={2}>
      {aggregateIds.map(aggregateId => (
        <AggregateCard
          key={aggregateId}
          aggregateId={aggregateId}
          eventStore={eventStore}
        />
      ))}
    </Stack>
  );
};
