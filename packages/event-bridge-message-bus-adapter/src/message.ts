import type { EventBridgeEvent } from 'aws-lambda';

import type {
  EventStoreEventsDetails,
  EventStoreAggregate,
  AggregateExistsMessage,
  AggregateExistsMessageBus,
  NotificationMessage,
  NotificationMessageBus,
  StateCarryingMessage,
  StateCarryingMessageBus,
  MessageChannelSourceEventStoreIds,
  MessageChannelSourceEventStoreIdTypes,
  MessageChannelSourceEventStores,
} from '@castore/core';

type EventBridgeStateCarryingMessageBusMessage<
  MESSAGE_BUS extends StateCarryingMessageBus,
  EVENT_STORE_IDS extends MessageChannelSourceEventStoreIds<MESSAGE_BUS> = MessageChannelSourceEventStoreIds<MESSAGE_BUS>,
  EVENT_TYPES extends MessageChannelSourceEventStoreIdTypes<
    MESSAGE_BUS,
    EVENT_STORE_IDS
  > = MessageChannelSourceEventStoreIdTypes<MESSAGE_BUS, EVENT_STORE_IDS>,
> = EVENT_STORE_IDS extends infer EVENT_STORE_ID
  ? EVENT_STORE_ID extends string
    ? EVENT_TYPES extends infer EVENT_TYPE
      ? EVENT_TYPE extends MessageChannelSourceEventStoreIdTypes<
          MESSAGE_BUS,
          EVENT_STORE_ID
        >
        ? EventBridgeEvent<
            EVENT_TYPE,
            StateCarryingMessage<
              EVENT_STORE_ID,
              Extract<
                EventStoreEventsDetails<
                  Extract<
                    MessageChannelSourceEventStores<MESSAGE_BUS>,
                    { eventStoreId: EVENT_STORE_IDS }
                  >
                >,
                { type: EVENT_TYPE }
              >,
              EventStoreAggregate<
                Extract<
                  MessageChannelSourceEventStores<MESSAGE_BUS>,
                  { eventStoreId: EVENT_STORE_IDS }
                >
              >
            >
          > & { source: EVENT_STORE_ID }
        : never
      : never
    : never
  : never;

type EventBridgeNotificationMessageBusMessage<
  MESSAGE_BUS extends NotificationMessageBus,
  EVENT_STORE_IDS extends MessageChannelSourceEventStoreIds<MESSAGE_BUS> = MessageChannelSourceEventStoreIds<MESSAGE_BUS>,
  EVENT_TYPES extends MessageChannelSourceEventStoreIdTypes<
    MESSAGE_BUS,
    EVENT_STORE_IDS
  > = MessageChannelSourceEventStoreIdTypes<MESSAGE_BUS, EVENT_STORE_IDS>,
> = EVENT_STORE_IDS extends infer EVENT_STORE_ID
  ? EVENT_STORE_ID extends string
    ? EVENT_TYPES extends infer EVENT_TYPE
      ? EVENT_TYPE extends MessageChannelSourceEventStoreIdTypes<
          MESSAGE_BUS,
          EVENT_STORE_ID
        >
        ? EventBridgeEvent<
            EVENT_TYPE,
            NotificationMessage<
              EVENT_STORE_ID,
              Extract<
                EventStoreEventsDetails<
                  Extract<
                    MessageChannelSourceEventStores<MESSAGE_BUS>,
                    { eventStoreId: EVENT_STORE_IDS }
                  >
                >,
                { type: EVENT_TYPE }
              >
            >
          > & { source: EVENT_STORE_ID }
        : never
      : never
    : never
  : never;

type EventBridgeAggregateExistsMessageBusMessage<
  MESSAGE_BUS extends AggregateExistsMessageBus,
  EVENT_STORE_IDS extends MessageChannelSourceEventStoreIds<MESSAGE_BUS> = MessageChannelSourceEventStoreIds<MESSAGE_BUS>,
> = EVENT_STORE_IDS extends infer EVENT_STORE_ID
  ? EVENT_STORE_ID extends string
    ? EventBridgeEvent<
        '__AGGREGATE_EXISTS__',
        AggregateExistsMessage<EVENT_STORE_ID>
      > & { source: EVENT_STORE_ID }
    : never
  : never;

type Prettify<OBJECTS extends Record<string, unknown>> =
  OBJECTS extends infer OBJECT
    ? {
        [KEY in keyof OBJECT]: OBJECT[KEY];
      }
    : never;

export type EventBridgeMessageBusMessage<
  MESSAGE_BUS extends
    | AggregateExistsMessageBus
    | NotificationMessageBus
    | StateCarryingMessageBus,
  EVENT_STORE_IDS extends MessageChannelSourceEventStoreIds<MESSAGE_BUS> = MessageChannelSourceEventStoreIds<MESSAGE_BUS>,
  EVENT_TYPES extends MESSAGE_BUS extends
    | NotificationMessageBus
    | StateCarryingMessageBus
    ? MessageChannelSourceEventStoreIdTypes<MESSAGE_BUS, EVENT_STORE_IDS>
    : never = MESSAGE_BUS extends
    | NotificationMessageBus
    | StateCarryingMessageBus
    ? MessageChannelSourceEventStoreIdTypes<MESSAGE_BUS, EVENT_STORE_IDS>
    : never,
> = Prettify<
  MESSAGE_BUS extends StateCarryingMessageBus
    ? EventBridgeStateCarryingMessageBusMessage<
        MESSAGE_BUS,
        EVENT_STORE_IDS,
        EVENT_TYPES
      >
    : MESSAGE_BUS extends NotificationMessageBus
    ? EventBridgeNotificationMessageBusMessage<
        MESSAGE_BUS,
        EVENT_STORE_IDS,
        EVENT_TYPES
      >
    : MESSAGE_BUS extends AggregateExistsMessageBus
    ? EventBridgeAggregateExistsMessageBusMessage<MESSAGE_BUS, EVENT_STORE_IDS>
    : never
>;
