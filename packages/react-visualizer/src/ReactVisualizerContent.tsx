import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';
import React, { useState } from 'react';

import type { EventStore } from '@castore/core';
import type { JSONSchemaCommand } from '@castore/json-schema-command';

import { DB as $DB, Commands } from './tabs';

enum TabName {
  COMMANDS = 'COMMANDS',
  DB = 'DB',
}

const { COMMANDS, DB } = TabName;

const defaultTabName = COMMANDS;
const orderedTabNames = [COMMANDS, DB];

export const ReactVisualizerContent = ({
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
