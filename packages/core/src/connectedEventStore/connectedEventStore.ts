import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type { EventType, EventTypeDetails } from '~/event/eventType';
import type { EventStorageAdapter } from '~/eventStorageAdapter';
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
  OnEventPushed,
} from '~/eventStore';
import type { EventStoreMessageChannel } from '~/messaging';
import type { $Contravariant } from '~/utils';

import { publishPushedEvent } from './publishPushedEvent';

export class ConnectedEventStore<
  EVENT_STORE_ID extends string = string,
  EVENT_TYPES extends EventType[] = EventType[],
  EVENT_DETAIL extends EventDetail = EventTypeDetails<EVENT_TYPES>,
  $EVENT_DETAIL extends EventDetail = $Contravariant<EVENT_DETAIL, EventDetail>,
  REDUCER extends Reducer<Aggregate, $EVENT_DETAIL> = Reducer<
    Aggregate,
    $EVENT_DETAIL
  >,
  AGGREGATE extends Aggregate = ReturnType<REDUCER>,
  $AGGREGATE extends Aggregate = $Contravariant<AGGREGATE, Aggregate>,
  MESSAGE_CHANNEL extends Pick<
    EventStoreMessageChannel<
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
    EventStoreMessageChannel<
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
  getEventStorageAdapter: () => EventStorageAdapter;

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
    this.getEventStorageAdapter = eventStore.getEventStorageAdapter;

    this.pushEvent = async (eventInput, options = {}) => {
      const response = await this.eventStore.pushEvent(eventInput, options);

      await publishPushedEvent(this, response);

      return response;
    };

    this.eventStore = eventStore;
    this.messageChannel = messageChannel;
  }

  set eventStorageAdapter(
    eventStorageAdapter: EventStorageAdapter | undefined,
  ) {
    this.eventStore.eventStorageAdapter = eventStorageAdapter;
  }

  get eventStorageAdapter(): EventStorageAdapter | undefined {
    return this.eventStore.eventStorageAdapter;
  }

  set onEventPushed(
    onEventPushed: OnEventPushed<$EVENT_DETAIL, $AGGREGATE> | undefined,
  ) {
    this.eventStore.onEventPushed = onEventPushed;
  }

  get onEventPushed(): OnEventPushed<$EVENT_DETAIL, $AGGREGATE> {
    return async props => {
      if (this.eventStore.onEventPushed !== undefined) {
        await this.eventStore.onEventPushed(props);
      }

      await publishPushedEvent(
        this,
        props as unknown as { event: EVENT_DETAIL; nextAggregate?: AGGREGATE },
      );
    };
  }
}
