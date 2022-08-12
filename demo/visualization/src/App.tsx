import { TabContext, TabList, TabPanel } from '@mui/lab';
import { CssBaseline, Tab, ThemeProvider } from '@mui/material';
import React, { useState } from 'react';
import { createGlobalState } from 'react-use';

import type { EventStore, JSONSchemaCommand } from '@castore/core';

import { EventStoreSynchronizer } from '~/components/EventStoreSynchronizer';
import { dbByEventStoreId, eventStoresById } from '~/services/data';

import { DB as $DB, Commands } from './tabs';
import { theme } from './theme';

enum TabName {
  COMMANDS = 'COMMANDS',
  DB = 'DB',
}

const { COMMANDS, DB } = TabName;

const defaultTabName = TabName.COMMANDS;
const orderedTabNames = [COMMANDS, DB];

const App = ({
  commands,
  eventStores,
}: {
  commands: JSONSchemaCommand[];
  eventStores: EventStore[];
}): JSX.Element => {
  const [activeTabName, setActiveTabName] = useState<TabName>(defaultTabName);

  return (
    <TabContext value={activeTabName}>
      <TabList
        onChange={(_, tabName: TabName) => {
          setActiveTabName(tabName);
        }}
        aria-label="Event Sourcing section"
        centered
        variant="fullWidth"
        sx={{
          padding: '0 20%',
          backgroundColor: '#dddddd',
          boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
        }}
      >
        {orderedTabNames.map(tabName => (
          // TODO: Use LinkTab instead
          <Tab key={tabName} label={tabName} value={tabName} />
        ))}
      </TabList>
      <TabPanel value={COMMANDS}>
        <Commands commands={commands} />
      </TabPanel>
      <TabPanel value={DB}>
        <$DB eventStores={eventStores} />
      </TabPanel>
    </TabContext>
  );
};

const AppProvider = ({
  commands,
  eventStores,
}: {
  commands: JSONSchemaCommand[];
  eventStores: EventStore[];
}): JSX.Element => {
  eventStores.forEach(eventStore => {
    dbByEventStoreId[eventStore.eventStoreId] = createGlobalState({});
    eventStoresById[eventStore.eventStoreId] = eventStore;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {eventStores.map(({ eventStoreId }) => (
        <EventStoreSynchronizer
          key={eventStoreId}
          eventStoreId={eventStoreId}
        />
      ))}
      <App commands={commands} eventStores={eventStores} />
    </ThemeProvider>
  );
};

export default AppProvider;
