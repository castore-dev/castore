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
  eventStoreId: I;
  /**
   * @debt v2 "rename as eventTypes"
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

  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: $D[] }>;
  pushEvent: (eventDetail: D) => Promise<void>;
  listAggregateIds: (
    listAggregateOptions?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;

  buildAggregate: (events: D[]) => A | undefined;
  getAggregate: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{
    aggregate: A | undefined;
    events: $D[];
    lastEvent: $D | undefined;
  }>;
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
