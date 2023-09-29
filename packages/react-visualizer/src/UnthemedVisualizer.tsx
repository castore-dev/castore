import React from 'react';
import { Provider } from 'react-redux';

import type { EventStore } from '@castore/core';
import { configureCastore } from '@castore/event-storage-adapter-redux';
import type { JSONSchemaCommand } from '@castore/json-schema-command';

import { VisualizerContent } from './VisualizerContent';

export const UnthemedVisualizer = ({
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
      <VisualizerContent
        commands={commands}
        eventStoreIds={eventStoreIds}
        eventStoresById={eventStoresById}
        contextsByCommandId={contextsByCommandId}
      />
    </Provider>
  );
};
