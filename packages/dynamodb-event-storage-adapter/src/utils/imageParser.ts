import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import {
  unmarshall,
  unmarshallOptions as UnmarshallOptions,
} from '@aws-sdk/util-dynamodb';

import type {
  EventDetail,
  EventStore,
  EventStoreNotificationMessage,
} from '@castore/core';

export class ImageParser<EVENT_STORES extends EventStore> {
  public sourceEventStores: EVENT_STORES[];
  public eventStoresById: Record<string, EventStore>;
  public parseImage: (
    image: Record<string, AttributeValue>,
    unmarshallOptions?: UnmarshallOptions,
  ) => EventStoreNotificationMessage<EVENT_STORES>;

  constructor({ sourceEventStores }: { sourceEventStores: EVENT_STORES[] }) {
    this.sourceEventStores = sourceEventStores;

    this.eventStoresById = {};
    this.sourceEventStores.forEach(eventStore => {
      this.eventStoresById[eventStore.eventStoreId] = eventStore;
    });

    this.parseImage = (image, unmarshallOptions = {}) => {
      const event = unmarshall(image, unmarshallOptions) as EventDetail;
      const prefixedAggregateId = event.aggregateId;
      const [eventStoreId, ...splitAggregateId] = prefixedAggregateId.split(
        '#',
      ) as [string, ...string[]];

      if (this.eventStoresById[eventStoreId] === undefined)
        throw new Error(
          `Unable to detect eventStore from image. Received eventStoreId: ${String(
            eventStoreId,
          )}`,
        );

      const aggregateId = splitAggregateId.join('#');
      const { version, type, timestamp, payload, metadata } = event;

      return {
        eventStoreId,
        event: {
          aggregateId,
          version,
          type,
          timestamp,
          ...(payload !== undefined ? { payload } : {}),
          ...(metadata !== undefined ? { metadata } : {}),
        },
      } as EventStoreNotificationMessage<EVENT_STORES>;
    };
  }
}
