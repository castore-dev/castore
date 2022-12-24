import { TabContext, TabList, TabPanel } from '@mui/lab';
import { CssBaseline, Tab, ThemeProvider } from '@mui/material';
import React, { useState } from 'react';
import { Provider } from 'react-redux';

import type { EventStore } from '@castore/core';
import type { JSONSchemaCommand } from '@castore/json-schema-command';
import { configureCastore } from '@castore/redux-event-storage-adapter';

import { DB as $DB, Commands } from './tabs';
import { theme } from './theme';

enum TabName {
  COMMANDS = 'COMMANDS',
  DB = 'DB',
}

const { COMMANDS, DB } = TabName;

const defaultTabName = COMMANDS;
const orderedTabNames = [COMMANDS, DB];

const Simulator = ({
  commands,
  eventStores,
  eventStoresById,
}: {
  commands: JSONSchemaCommand[];
  eventStores: EventStore[];
  eventStoresById: Record<string, EventStore>;
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
        <Commands commands={commands} eventStoresById={eventStoresById} />
      </TabPanel>
      <TabPanel value={DB}>
        <$DB eventStores={eventStores} />
      </TabPanel>
    </TabContext>
  );
};

const SimulatorWrapper = ({
  commands,
  eventStores,
}: {
  commands: JSONSchemaCommand[];
  eventStores: EventStore[];
}): JSX.Element => {
  const store = configureCastore({ eventStores });

  const eventStoresById: Record<string, EventStore> = {};
  eventStores.forEach(eventStore => {
    eventStoresById[eventStore.eventStoreId] = eventStore;
  });

  return (
    <Provider store={store}>
      <Simulator
        commands={commands}
        eventStores={eventStores}
        eventStoresById={eventStoresById}
      />
    </Provider>
  );
};

const App = ({
  commands,
  eventStores,
}: {
  commands: JSONSchemaCommand[];
  eventStores: EventStore[];
}): JSX.Element => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SimulatorWrapper commands={commands} eventStores={eventStores} />
  </ThemeProvider>
);

export default App;
