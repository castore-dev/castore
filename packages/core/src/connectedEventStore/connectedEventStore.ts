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
  SnapshotMode,
} from '~/eventStore';
import type { EventStoreMessageChannel } from '~/messaging';
import type { $Contravariant } from '~/utils';

import { publishPushedEvent } from './publishPushedEvent';

export class ConnectedEventStore<
  EVENT_STORE_ID extends string = string,
  EVENT_TYPES extends EventType[] = EventType[],
  EVENT_DETAILS extends EventDetail = EventTypeDetails<EVENT_TYPES>,
  $EVENT_DETAILS extends EventDetail = $Contravariant<
    EVENT_DETAILS,
    EventDetail
  >,
  REDUCERS extends Record<string, Reducer<Aggregate, $EVENT_DETAILS>> = Record<
    string,
    Reducer<Aggregate, $EVENT_DETAILS>
  >,
  CURRENT_REDUCER_VERSION extends keyof REDUCERS & string = keyof REDUCERS &
    string,
  REDUCER extends Reducer<
    Aggregate,
    $EVENT_DETAILS
  > = REDUCERS[CURRENT_REDUCER_VERSION],
  AGGREGATE extends Aggregate = ReturnType<REDUCER>,
  $AGGREGATE extends Aggregate = $Contravariant<AGGREGATE, Aggregate>,
  MESSAGE_CHANNEL extends Pick<
    EventStoreMessageChannel<
      EventStore<
        EVENT_STORE_ID,
        EVENT_TYPES,
        EVENT_DETAILS,
        $EVENT_DETAILS,
        REDUCERS,
        CURRENT_REDUCER_VERSION,
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
        EVENT_DETAILS,
        $EVENT_DETAILS,
        REDUCERS,
        CURRENT_REDUCER_VERSION,
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
      EVENT_DETAILS,
      $EVENT_DETAILS,
      REDUCERS,
      CURRENT_REDUCER_VERSION,
      REDUCER,
      AGGREGATE,
      $AGGREGATE
    >
{
  _types?: {
    details: EVENT_DETAILS;
    aggregate: AGGREGATE;
  };
  eventStoreId: EVENT_STORE_ID;
  eventTypes: EVENT_TYPES;
  snapshotMode: SnapshotMode;
  autoSnapshotPeriodVersions?: number | undefined;
  reducers: REDUCERS;
  currentReducerVersion: CURRENT_REDUCER_VERSION;
  reducer: REDUCER;
  simulateSideEffect: SideEffectsSimulator<EVENT_DETAILS, $EVENT_DETAILS>;
  getEvents: EventsGetter<EVENT_DETAILS>;
  pushEvent: EventPusher<EVENT_DETAILS, $EVENT_DETAILS, AGGREGATE, $AGGREGATE>;
  groupEvent: EventGrouper<
    EVENT_DETAILS,
    $EVENT_DETAILS,
    AGGREGATE,
    $AGGREGATE
  >;
  listAggregateIds: AggregateIdsLister;
  buildAggregate: (
    events: $EVENT_DETAILS[],
    aggregate?: $AGGREGATE,
  ) => AGGREGATE | undefined;
  getAggregate: AggregateGetter<EVENT_DETAILS, AGGREGATE>;
  getExistingAggregate: AggregateGetter<EVENT_DETAILS, AGGREGATE, true>;
  simulateAggregate: AggregateSimulator<$EVENT_DETAILS, AGGREGATE>;
  getEventStorageAdapter: () => EventStorageAdapter;

  eventStore: EventStore<
    EVENT_STORE_ID,
    EVENT_TYPES,
    EVENT_DETAILS,
    $EVENT_DETAILS,
    REDUCERS,
    CURRENT_REDUCER_VERSION,
    REDUCER,
    AGGREGATE,
    $AGGREGATE
  >;
  messageChannel: MESSAGE_CHANNEL;

  constructor(
    eventStore: EventStore<
      EVENT_STORE_ID,
      EVENT_TYPES,
      EVENT_DETAILS,
      $EVENT_DETAILS,
      REDUCERS,
      CURRENT_REDUCER_VERSION,
      REDUCER,
      AGGREGATE,
      $AGGREGATE
    >,
    messageChannel: MESSAGE_CHANNEL,
  ) {
    this.eventStoreId = eventStore.eventStoreId;
    this.eventTypes = eventStore.eventTypes;
    this.snapshotMode = eventStore.snapshotMode;
    if (eventStore.autoSnapshotPeriodVersions !== undefined) {
      this.autoSnapshotPeriodVersions = eventStore.autoSnapshotPeriodVersions;
    }
    this.reducers = eventStore.reducers;
    this.currentReducerVersion = eventStore.currentReducerVersion;
    this.reducer = eventStore.reducer;
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
    onEventPushed: OnEventPushed<$EVENT_DETAILS, $AGGREGATE> | undefined,
  ) {
    this.eventStore.onEventPushed = onEventPushed;
  }

  get onEventPushed(): OnEventPushed<$EVENT_DETAILS, $AGGREGATE> {
    return async props => {
      if (this.eventStore.onEventPushed !== undefined) {
        await this.eventStore.onEventPushed(props);
      }

      await publishPushedEvent(
        this,
        props as unknown as { event: EVENT_DETAILS; nextAggregate?: AGGREGATE },
      );
    };
  }
}
