import React from 'react';
import { Provider } from 'react-redux';

import { EventStore } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';
import { configureCastore } from '@castore/redux-event-storage-adapter';

import { ReactVisualizerContent } from './ReactVisualizerContent';

export const UnthemedReactVisualizer = ({
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
      <ReactVisualizerContent
        commands={commands}
        eventStoreIds={eventStoreIds}
        eventStoresById={eventStoresById}
        contextsByCommandId={contextsByCommandId}
      />
    </Provider>
  );
};
