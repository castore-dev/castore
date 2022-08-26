/* eslint-disable max-lines */
import type { Aggregate } from '~/aggregate';
import { AggregateNotFoundError } from '~/errors/aggregateNotFound';
import { UndefinedStorageAdapterError } from '~/errors/undefinedStorageAdapterError';
import type { EventDetail } from '~/event/eventDetail';
import type { EventType, EventTypesDetails } from '~/event/eventType';
import type {
  EventsQueryOptions,
  ListAggregateIdsOptions,
  ListAggregateIdsOutput,
  StorageAdapter,
} from '~/storageAdapter';

export type SimulationOptions = { simulationDate?: string };

/**
 * @class EventStore
 * @description Instance of an EventStore.
 * Use it to manipulate events within your database.
 */
export class EventStore<
  I extends string = string,
  E extends EventType[] = EventType[],
  $D extends EventDetail = EventTypesDetails<E>,
  // cf https://devblogs.microsoft.com/typescript/announcing-typescript-4-7-rc/#optional-variance-annotations-for-type-parameters
  // EventStore is contravariant on its fns args: We have to type them as any
  // So that EventStore implementations still extends the EventStore type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends EventDetail = EventDetail extends $D ? any : $D,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends (aggregate: any, event: D) => Aggregate = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aggregate: any,
    event: D,
  ) => Aggregate,
  A extends Aggregate = ReturnType<R>,
> {
  // @ts-ignore _types only
  _types: {
    details: $D;
    aggregate: A;
  };
  /**
   * @name eventStoreId
   * @description The ID of the EventStore.
   */
  eventStoreId: I;
  /**
   * @debt v2 "rename as eventTypes"
   */
  /**
   * @name eventStoreEvents
   * @description A list of events the store will manipulate.
   */
  eventStoreEvents: E;
  /**
   * @debt v2 "rename as reducer"
   */
  reduce: R;
  simulateSideEffect: (
    indexedEvents: Record<string, Omit<D, 'version'>>,
    event: D,
  ) => Record<string, Omit<D, 'version'>>;

  /**
   * @name getEvents
   * @description Asynchronously gets a list of all events with the same aggregateId.
   * @param aggregateId - The ID of the aggregate to get events for.
   * @param options
   * @param options.maxVersion - Retrieve all events with version < maxVersion.
   * @returns An object containing the list of events.
   */
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: $D[] }>;
  /**
   * @name pushEvent
   * @description Asynchronously pushes a new event to the event store.
   * @param eventDetail - Details of the event to push. Strongly typed according to eventStoreEvents the EventStore has been instantiated with.
   * @returns void
   */
  pushEvent: (eventDetail: D) => Promise<void>;
  /**
   * @name listAggregateIds
   * @description Asynchronously lists all aggregateIds in the event store.
   * @param listAggregateOptions - listAggregateIds options
   * @param listAggregateOptions.limit - maximum number of aggregateIds to return per page
   * @param listAggregateOptions.pageToken - token to access next page of aggregateIds
   * @returns aggregateIds: the list of aggregateIds in the event store
   * @returns nextPageToken: token to access next page of aggregateIds
   */
  listAggregateIds: (
    listAggregateOptions?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;

  buildAggregate: (events: D[]) => A | undefined;

  /**
   * @name getAggregate
   * @description Asynchronously builds the aggregate from the events in the event store by applying the reducer.
   * @param aggregateId - aggregateId for which the aggregate will be built
   * @param options
   * @param options.maxVersion -  computes the aggregate up until maxVersion.
   * @returns aggregate: the aggregate associated with the aggregateId
   * @returns events: list of events that were used to build the aggregate
   * @returns lastEvent: lastEvent that was used to build the aggregate
   */
  getAggregate: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{
    aggregate: A | undefined;
    events: $D[];
    lastEvent: $D | undefined;
  }>;
  /**
   * @name getExistingAggregate
   * @description getAggregate but throws an error if the aggregate is not found.
   */
  getExistingAggregate: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{
    aggregate: A;
    events: $D[];
    lastEvent: $D;
  }>;
  simulateAggregate: (
    events: D[],
    options?: SimulationOptions,
  ) => A | undefined;
  /**
   * @debt v2 "rename as eventStorageAdapter"
   */
  storageAdapter?: StorageAdapter;

  constructor({
    eventStoreId,
    eventStoreEvents,
    reduce,
    simulateSideEffect = (indexedEvents, event) => ({
      ...indexedEvents,
      [event.version]: event,
    }),
    storageAdapter,
  }: {
    eventStoreId: I;
    /**
     * @debt v2 "rename as eventTypes"
     */
    eventStoreEvents: E;
    /**
     * @debt v2 "rename as reducer"
     */
    reduce: R;
    simulateSideEffect?: (
      indexedEvents: Record<string, Omit<D, 'version'>>,
      event: D,
    ) => Record<string, Omit<D, 'version'>>;
    storageAdapter?: StorageAdapter;
  }) {
    this.eventStoreId = eventStoreId;
    this.eventStoreEvents = eventStoreEvents;
    this.reduce = reduce;
    this.simulateSideEffect = simulateSideEffect;
    /**
     * @debt v2 "rename as eventStorageAdapter"
     */
    this.storageAdapter = storageAdapter;

    this.getEvents = async (aggregateId, queryOptions) => {
      if (!this.storageAdapter) {
        throw new UndefinedStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      /**
       * @debt feature "For the moment we just cast, we could implement validation + type guards at EventType level"
       */
      return this.storageAdapter.getEvents(
        aggregateId,
        queryOptions,
      ) as Promise<{ events: $D[] }>;
    };

    this.pushEvent = async (eventDetail: D) => {
      if (!this.storageAdapter) {
        throw new UndefinedStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      return this.storageAdapter.pushEvent(eventDetail, {
        eventStoreId: this.eventStoreId,
      });
    };

    this.listAggregateIds = async (options?: ListAggregateIdsOptions) => {
      if (!this.storageAdapter) {
        throw new UndefinedStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      return this.storageAdapter.listAggregateIds(options);
    };

    this.buildAggregate = (eventDetails: D[]) =>
      eventDetails.reduce(this.reduce, undefined as unknown as A) as
        | A
        | undefined;

    this.getAggregate = async (aggregateId, options) => {
      const { events } = await this.getEvents(aggregateId, options);
      const aggregate = this.buildAggregate(events as unknown as D[]);
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

    this.simulateAggregate = (
      events,
      { simulationDate } = {},
    ): A | undefined => {
      let eventsWithSideEffects = Object.values(
        events.reduce(this.simulateSideEffect, {} as Record<string, D>),
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
        .map((event, index) => ({ ...event, version: index + 1 })) as D[];

      return this.buildAggregate(sortedEventsWithSideEffects);
    };
  }
}

export type EventStoreId<E extends EventStore> = E['eventStoreId'];

export type EventStoreEventsTypes<E extends EventStore> = E['eventStoreEvents'];

export type EventStoreEventsDetails<E extends EventStore> =
  E['_types']['details'];

export type EventStoreReducer<E extends EventStore> = E['reduce'];

export type EventStoreAggregate<E extends EventStore> =
  E['_types']['aggregate'];
