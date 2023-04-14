/* eslint-disable max-lines */
import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type { EventType, EventTypesDetails } from '~/event/eventType';
import type { GroupedEvent } from '~/event/groupedEvent';
import type { StorageAdapter } from '~/storageAdapter';
import type { $Contravariant } from '~/utils';

import { AggregateNotFoundError } from './errors/aggregateNotFound';
import { UndefinedStorageAdapterError } from './errors/undefinedStorageAdapter';
import type {
  AggregateIdsLister,
  EventPusher,
  EventsGetter,
  EventGrouper,
  SideEffectsSimulator,
  AggregateGetter,
  AggregateSimulator,
  Reducer,
} from './types';

export class EventStore<
  EVENT_STORE_ID extends string = string,
  EVENT_TYPES extends EventType[] = EventType[],
  EVENT_DETAILS extends EventDetail = EventTypesDetails<EVENT_TYPES>,
  // cf https://devblogs.microsoft.com/typescript/announcing-typescript-4-7-rc/#optional-variance-annotations-for-type-parameters
  // EventStore is contravariant on its fns args: We have to type them as "any" so that EventStore implementations still extends the EventStore type
  $EVENT_DETAILS extends EventDetail = $Contravariant<
    EVENT_DETAILS,
    EventDetail
  >,
  REDUCER extends Reducer<Aggregate, $EVENT_DETAILS> = Reducer<
    Aggregate,
    $EVENT_DETAILS
  >,
  AGGREGATE extends Aggregate = ReturnType<REDUCER>,
  $AGGREGATE extends Aggregate = $Contravariant<AGGREGATE, Aggregate>,
> {
  _types?: {
    details: EVENT_DETAILS;
    aggregate: AGGREGATE;
  };
  eventStoreId: EVENT_STORE_ID;
  /**
   * @debt v2 "rename as eventTypes"
   */
  eventStoreEvents: EVENT_TYPES;
  /**
   * @debt v2 "rename as reducer"
   */
  reduce: REDUCER;
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
  /**
   * @debt v2 "rename as eventStorageAdapter"
   */
  storageAdapter?: StorageAdapter;
  getStorageAdapter: () => StorageAdapter;

  constructor({
    eventStoreId,
    eventStoreEvents,
    reduce,
    simulateSideEffect = (indexedEvents, event) => ({
      ...indexedEvents,
      [event.version]: event,
    }),
    storageAdapter: $storageAdapter,
  }: {
    eventStoreId: EVENT_STORE_ID;
    /**
     * @debt v2 "rename as eventTypes"
     */
    eventStoreEvents: EVENT_TYPES;
    /**
     * @debt v2 "rename as reducer"
     */
    reduce: REDUCER;
    simulateSideEffect?: SideEffectsSimulator<EVENT_DETAILS, $EVENT_DETAILS>;
    storageAdapter?: StorageAdapter;
  }) {
    this.eventStoreId = eventStoreId;
    this.eventStoreEvents = eventStoreEvents;
    this.reduce = reduce;
    this.simulateSideEffect = simulateSideEffect;
    /**
     * @debt v2 "rename as eventStorageAdapter"
     */
    this.storageAdapter = $storageAdapter;

    this.getStorageAdapter = () => {
      if (!this.storageAdapter) {
        throw new UndefinedStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      return this.storageAdapter;
    };

    this.getEvents = (aggregateId, queryOptions) =>
      this.getStorageAdapter().getEvents(
        aggregateId,
        queryOptions,
        /**
         * @debt feature "For the moment we just cast, we could implement validation + type guards at EventType level"
         */
      ) as Promise<{ events: EVENT_DETAILS[] }>;

    this.pushEvent = async (eventDetail, { prevAggregate } = {}) => {
      const storageAdapter = this.getStorageAdapter();

      const { event } = (await storageAdapter.pushEvent(eventDetail, {
        eventStoreId: this.eventStoreId,
      })) as { event: $EVENT_DETAILS };

      let nextAggregate: AGGREGATE | undefined = undefined;
      if (prevAggregate || event.version === 1) {
        nextAggregate = this.reduce(prevAggregate, event) as AGGREGATE;
      }

      return {
        event: event as unknown as EVENT_DETAILS,
        ...(nextAggregate ? { nextAggregate } : {}),
      };
    };

    this.groupEvent = (eventDetail, { prevAggregate } = {}) => {
      const storageAdapter = this.getStorageAdapter();

      const groupedEvent = storageAdapter.groupEvent(
        eventDetail,
      ) as GroupedEvent<EVENT_DETAILS, AGGREGATE>;

      if (prevAggregate !== undefined) {
        groupedEvent.prevAggregate = prevAggregate as unknown as AGGREGATE;
      }

      return groupedEvent;
    };

    this.listAggregateIds = options =>
      this.getStorageAdapter().listAggregateIds(options);

    this.buildAggregate = (eventDetails, aggregate) =>
      eventDetails.reduce(this.reduce, aggregate) as AGGREGATE | undefined;

    this.getAggregate = async (aggregateId, { maxVersion } = {}) => {
      const { events } = await this.getEvents(aggregateId, { maxVersion });

      const aggregate = this.buildAggregate(
        events as unknown as $EVENT_DETAILS[],
        undefined,
      );

      const lastEvent = events[events.length - 1];

      return { aggregate, events, lastEvent };
    };

    this.getExistingAggregate = async (aggregateId, options) => {
      const { aggregate, lastEvent, ...restAggregate } =
        await this.getAggregate(aggregateId, options);

      if (aggregate === undefined || lastEvent === undefined) {
        throw new AggregateNotFoundError({
          aggregateId,
          eventStoreId: this.eventStoreId,
        });
      }

      return { aggregate, lastEvent, ...restAggregate };
    };

    this.simulateAggregate = (events, { simulationDate } = {}) => {
      let eventsWithSideEffects = Object.values(
        events.reduce(
          this.simulateSideEffect as unknown as (
            indexedEvents: Record<string, Omit<$EVENT_DETAILS, 'version'>>,
            event: $EVENT_DETAILS,
          ) => Record<string, Omit<$EVENT_DETAILS, 'version'>>,
          {} as Record<string, $EVENT_DETAILS>,
        ),
      );

      if (simulationDate !== undefined) {
        eventsWithSideEffects = eventsWithSideEffects.filter(
          ({ timestamp }) => timestamp <= simulationDate,
        );
      }

      const sortedEventsWithSideEffects = eventsWithSideEffects
        .sort(({ timestamp: timestampA }, { timestamp: timestampB }) =>
          timestampA < timestampB ? -1 : 1,
        )
        .map((event, index) => ({
          ...event,
          version: index + 1,
        })) as $EVENT_DETAILS[];

      return this.buildAggregate(sortedEventsWithSideEffects);
    };
  }
}
