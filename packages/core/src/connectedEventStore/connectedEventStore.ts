import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type { EventType, EventTypesDetails } from '~/event/eventType';
import type {
  Reducer,
  AggregateIdsLister,
  EventPusher,
  EventGrouper,
  EventsGetter,
  SideEffectsSimulator,
  AggregateGetter,
  AggregateSimulator,
  EventStore,
} from '~/eventStore';
import {
  EventStoreNotificationMessage,
  NotificationMessageBus,
  NotificationMessageQueue,
  EventStoreStateCarryingMessage,
  StateCarryingMessageBus,
  StateCarryingMessageQueue,
} from '~/messaging';
import type { StorageAdapter } from '~/storageAdapter';
import type { $Contravariant } from '~/utils';

type MessageChannel<EVENT_STORE extends EventStore> =
  | NotificationMessageQueue<EVENT_STORE>
  | NotificationMessageBus<EVENT_STORE>
  | StateCarryingMessageQueue<EVENT_STORE>
  | StateCarryingMessageBus<EVENT_STORE>;

export class ConnectedEventStore<
  EVENT_STORE_ID extends string = string,
  EVENT_TYPES extends EventType[] = EventType[],
  EVENT_DETAIL extends EventDetail = EventTypesDetails<EVENT_TYPES>,
  $EVENT_DETAIL extends EventDetail = $Contravariant<EVENT_DETAIL, EventDetail>,
  REDUCER extends Reducer<Aggregate, $EVENT_DETAIL> = Reducer<
    Aggregate,
    $EVENT_DETAIL
  >,
  AGGREGATE extends Aggregate = ReturnType<REDUCER>,
  $AGGREGATE extends Aggregate = $Contravariant<AGGREGATE, Aggregate>,
  MESSAGE_CHANNEL extends Pick<
    MessageChannel<
      EventStore<
        EVENT_STORE_ID,
        EVENT_TYPES,
        EVENT_DETAIL,
        $EVENT_DETAIL,
        REDUCER,
        AGGREGATE,
        $AGGREGATE
      >
    >,
    'publishMessage'
  > = Pick<
    MessageChannel<
      EventStore<
        EVENT_STORE_ID,
        EVENT_TYPES,
        EVENT_DETAIL,
        $EVENT_DETAIL,
        REDUCER,
        AGGREGATE,
        $AGGREGATE
      >
    >,
    'publishMessage'
  >,
> implements
    EventStore<
      EVENT_STORE_ID,
      EVENT_TYPES,
      EVENT_DETAIL,
      $EVENT_DETAIL,
      REDUCER,
      AGGREGATE,
      $AGGREGATE
    >
{
  _types?: {
    details: EVENT_DETAIL;
    aggregate: AGGREGATE;
  };
  eventStoreId: EVENT_STORE_ID;
  eventStoreEvents: EVENT_TYPES;
  reduce: REDUCER;
  simulateSideEffect: SideEffectsSimulator<EVENT_DETAIL, $EVENT_DETAIL>;
  getEvents: EventsGetter<EVENT_DETAIL>;
  pushEvent: EventPusher<EVENT_DETAIL, $EVENT_DETAIL, AGGREGATE, $AGGREGATE>;
  groupEvent: EventGrouper<EVENT_DETAIL, $EVENT_DETAIL, AGGREGATE, $AGGREGATE>;
  listAggregateIds: AggregateIdsLister;
  buildAggregate: (
    events: $EVENT_DETAIL[],
    aggregate?: $AGGREGATE,
  ) => AGGREGATE | undefined;
  getAggregate: AggregateGetter<EVENT_DETAIL, AGGREGATE>;
  getExistingAggregate: AggregateGetter<EVENT_DETAIL, AGGREGATE, true>;
  simulateAggregate: AggregateSimulator<$EVENT_DETAIL, AGGREGATE>;
  getStorageAdapter: () => StorageAdapter;

  eventStore: EventStore<
    EVENT_STORE_ID,
    EVENT_TYPES,
    EVENT_DETAIL,
    $EVENT_DETAIL,
    REDUCER,
    AGGREGATE,
    $AGGREGATE
  >;
  messageChannel: MESSAGE_CHANNEL;

  constructor(
    eventStore: EventStore<
      EVENT_STORE_ID,
      EVENT_TYPES,
      EVENT_DETAIL,
      $EVENT_DETAIL,
      REDUCER,
      AGGREGATE,
      $AGGREGATE
    >,
    messageChannel: MESSAGE_CHANNEL,
  ) {
    this.eventStoreId = eventStore.eventStoreId;
    this.eventStoreEvents = eventStore.eventStoreEvents;
    this.reduce = eventStore.reduce;
    this.simulateSideEffect = eventStore.simulateSideEffect;
    this.getEvents = eventStore.getEvents;
    this.groupEvent = eventStore.groupEvent;
    this.listAggregateIds = eventStore.listAggregateIds;
    this.buildAggregate = eventStore.buildAggregate;
    this.getAggregate = eventStore.getAggregate;
    this.getExistingAggregate = eventStore.getExistingAggregate;
    this.simulateAggregate = eventStore.simulateAggregate;
    this.getStorageAdapter = eventStore.getStorageAdapter;

    this.pushEvent = async (eventInput, options = {}) => {
      const response = await this.eventStore.pushEvent(eventInput, options);
      const { event, nextAggregate } = response;

      if (
        /**
         * @debt refactor "Create NotificationMessageChannel class w. only publish prop, extended by MessageQueues & Bus"
         */
        this.messageChannel instanceof NotificationMessageQueue ||
        this.messageChannel instanceof NotificationMessageBus
      ) {
        await this.messageChannel.publishMessage({
          eventStoreId: this.eventStoreId,
          event,
        } as EventStoreNotificationMessage<this['eventStore']>);
      }

      if (
        /**
         * @debt refactor "Create StateCarryingMessageChannel class w. only publish prop, extended by MessageQueues & Bus"
         */
        this.messageChannel instanceof StateCarryingMessageQueue ||
        this.messageChannel instanceof StateCarryingMessageBus
      ) {
        let aggregate: AGGREGATE | undefined = nextAggregate;

        if (aggregate === undefined) {
          const { aggregateId } = event;
          aggregate = (
            await this.getAggregate(aggregateId, { maxVersion: event.version })
          ).aggregate;
        }

        await this.messageChannel.publishMessage({
          eventStoreId: this.eventStoreId,
          event,
          aggregate,
        } as EventStoreStateCarryingMessage<this['eventStore']>);
      }

      return response;
    };

    this.eventStore = eventStore;
    this.messageChannel = messageChannel;
  }

  /**
   * @debt v2 "rename as eventStorageAdapter"
   */
  set storageAdapter(storageAdapter: StorageAdapter | undefined) {
    this.eventStore.storageAdapter = storageAdapter;
  }

  get storageAdapter(): StorageAdapter | undefined {
    return this.eventStore.storageAdapter;
  }
}
