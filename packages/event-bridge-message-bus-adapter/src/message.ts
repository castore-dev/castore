import type { EventBridgeEvent } from 'aws-lambda';

import type {
  EventStoreEventsDetails,
  EventStoreAggregate,
  NotificationMessageBus,
  StatefulMessageBus,
  MessageBusSourceEventStoresIds,
  MessageBusSourceEventStoreIdTypes,
  MessageBusSourceEventStores,
} from '@castore/core';

type Prettify<T extends Record<string, unknown>> = T extends infer U
  ? {
      [K in keyof U]: U[K];
    }
  : never;

export type EventBridgeMessageBusMessage<
  M extends NotificationMessageBus | StatefulMessageBus,
  S extends MessageBusSourceEventStoresIds<M> = MessageBusSourceEventStoresIds<M>,
  T extends MessageBusSourceEventStoreIdTypes<
    M,
    S
  > = MessageBusSourceEventStoreIdTypes<M, S>,
> = Prettify<
  S extends infer I
    ? I extends string
      ? T extends infer U
        ? U extends MessageBusSourceEventStoreIdTypes<M, I>
          ? EventBridgeEvent<
              U,
              EventStoreEventsDetails<
                Extract<MessageBusSourceEventStores<M>, { eventStoreId: S }>
              > & { type: U } & (M extends StatefulMessageBus
                  ? {
                      aggregate: EventStoreAggregate<
                        Extract<
                          MessageBusSourceEventStores<M>,
                          { eventStoreId: S }
                        >
                      >;
                    }
                  : unknown)
            > & { source: I }
          : never
        : never
      : never
    : never
>;
