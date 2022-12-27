import { TabContext, TabList, TabPanel } from '@mui/lab';
import { CssBaseline, Tab, ThemeProvider } from '@mui/material';
import React, { useState } from 'react';
import { Provider } from 'react-redux';

import type {
  EventStore,
  Command,
  CommandId,
  CommandContext,
} from '@castore/core';
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
  eventStoreIds,
  eventStoresById,
  contextsByCommandId,
}: {
  commands: JSONSchemaCommand[];
  eventStoreIds: string[];
  eventStoresById: Record<string, EventStore>;
  contextsByCommandId: Record<string, unknown[]>;
}): JSX.Element => {
  const [activeTabName, setActiveTabName] = useState<TabName>(defaultTabName);

  return (
    <TabContext value={activeTabName}>
      <TabList
        onChange={(_, tabName: TabName) => setActiveTabName(tabName)}
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
        <Commands
          commands={commands}
          eventStoresById={eventStoresById}
          contextsByCommandId={contextsByCommandId}
        />
      </TabPanel>
      <TabPanel value={DB}>
        <$DB eventStoreIds={eventStoreIds} eventStoresById={eventStoresById} />
      </TabPanel>
    </TabContext>
  );
};

const SimulatorWrapper = ({
  commands,
  eventStores,
  contextsByCommandId,
}: {
  commands: JSONSchemaCommand[];
  eventStores: EventStore[];
  contextsByCommandId: Record<string, unknown[]>;
}): JSX.Element => {
  const store = configureCastore({ eventStores });

  const eventStoresById: Record<string, EventStore> = {};
  const eventStoreIds: string[] = [];
  eventStores.forEach(eventStore => {
    eventStoreIds.push(eventStore.eventStoreId);
    eventStoresById[eventStore.eventStoreId] = eventStore;
  });

  return (
    <Provider store={store}>
      <Simulator
        commands={commands}
        eventStoreIds={eventStoreIds}
        eventStoresById={eventStoresById}
        contextsByCommandId={contextsByCommandId}
      />
    </Provider>
  );
};

type ContextsByCommandId<C extends Command[]> = C extends [infer H, ...infer T]
  ? H extends Command
    ? T extends Command[]
      ? CommandContext<H>['length'] extends 0
        ? ContextsByCommandId<T>
        : Record<CommandId<H>, CommandContext<H>> & ContextsByCommandId<T>
      : never
    : never
  : Record<never, unknown[]>;

const App = <C extends JSONSchemaCommand[]>({
  commands,
  eventStores,
  contextsByCommandId,
}: {
  commands: C;
  eventStores: EventStore[];
  contextsByCommandId: ContextsByCommandId<C>;
}): JSX.Element => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SimulatorWrapper
      commands={commands}
      eventStores={eventStores}
      contextsByCommandId={contextsByCommandId}
    />
  </ThemeProvider>
);

export default App;
