import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';
import React, { useState } from 'react';

import type { EventStore } from '@castore/event-store';

import { EventStoreDB } from './EventStoreDB';

export const DB = ({
  eventStores,
}: {
  eventStores: EventStore[];
}): JSX.Element => {
  const [selectedEventStoreId, selectEventStoreId] = useState(
    eventStores[0].eventStoreId,
  );

  return (
    <TabContext value={selectedEventStoreId}>
      <TabList
        onChange={(_, eventStoreId: string) => {
          selectEventStoreId(eventStoreId);
        }}
        aria-label="Event-store section"
        centered
      >
        {eventStores.map(({ eventStoreId }) => (
          <Tab key={eventStoreId} label={eventStoreId} value={eventStoreId} />
        ))}
      </TabList>
      {eventStores.map(eventStore => (
        <TabPanel key={eventStore.eventStoreId} value={eventStore.eventStoreId}>
          <EventStoreDB eventStore={eventStore} />
        </TabPanel>
      ))}
    </TabContext>
  );
};
