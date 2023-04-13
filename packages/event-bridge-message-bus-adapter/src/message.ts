import type { EventBridgeEvent } from 'aws-lambda';

import type {
  EventStoreEventsDetails,
  EventStoreAggregate,
  NotificationMessageBus,
  StateCarryingMessageBus,
  NotificationMessage,
  StateCarryingMessage,
  MessageBusSourceEventStoresIds,
  MessageBusSourceEventStoreIdTypes,
  MessageBusSourceEventStores,
} from '@castore/core';

type Prettify<OBJECTS extends Record<string, unknown>> =
  OBJECTS extends infer OBJECT
    ? {
        [KEY in keyof OBJECT]: OBJECT[KEY];
      }
    : never;

export type EventBridgeMessageBusMessage<
  MESSAGE_BUS extends StateCarryingMessageBus | NotificationMessageBus,
  EVENT_STORE_IDS extends MessageBusSourceEventStoresIds<MESSAGE_BUS> = MessageBusSourceEventStoresIds<MESSAGE_BUS>,
  EVENT_TYPES extends MessageBusSourceEventStoreIdTypes<
    MESSAGE_BUS,
    EVENT_STORE_IDS
  > = MessageBusSourceEventStoreIdTypes<MESSAGE_BUS, EVENT_STORE_IDS>,
> = Prettify<
  EVENT_STORE_IDS extends infer EVENT_STORE_ID
    ? EVENT_STORE_ID extends string
      ? EVENT_TYPES extends infer EVENT_TYPE
        ? EVENT_TYPE extends MessageBusSourceEventStoreIdTypes<
            MESSAGE_BUS,
            EVENT_STORE_ID
          >
          ? EventBridgeEvent<
              EVENT_TYPE,
              MESSAGE_BUS extends StateCarryingMessageBus
                ? StateCarryingMessage<
                    EVENT_STORE_ID,
                    Extract<
                      EventStoreEventsDetails<
                        Extract<
                          MessageBusSourceEventStores<MESSAGE_BUS>,
                          { eventStoreId: EVENT_STORE_IDS }
                        >
                      >,
                      { type: EVENT_TYPE }
                    >,
                    EventStoreAggregate<
                      Extract<
                        MessageBusSourceEventStores<MESSAGE_BUS>,
                        { eventStoreId: EVENT_STORE_IDS }
                      >
                    >
                  >
                : MESSAGE_BUS extends NotificationMessageBus
                ? NotificationMessage<
                    EVENT_STORE_ID,
                    Extract<
                      EventStoreEventsDetails<
                        Extract<
                          MessageBusSourceEventStores<MESSAGE_BUS>,
                          { eventStoreId: EVENT_STORE_IDS }
                        >
                      >,
                      { type: EVENT_TYPE }
                    >
                  >
                : never
            > & { source: EVENT_STORE_ID }
          : never
        : never
      : never
    : never
>;
