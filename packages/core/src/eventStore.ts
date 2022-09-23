/* eslint-disable max-lines */
import type { Aggregate } from '~/aggregate';
import { AggregateNotFoundError } from '~/errors/aggregateNotFound';
import { InvalidSnapshotIntervalError } from '~/errors/invalidSnapshotIntervalError';
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
  D extends EventDetail = EventTypesDetails<E>,
  // cf https://devblogs.microsoft.com/typescript/announcing-typescript-4-7-rc/#optional-variance-annotations-for-type-parameters
  // EventStore is contravariant on its fns args: We have to type them as any
  // So that EventStore implementations still extends the EventStore type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $D extends EventDetail = EventDetail extends D ? any : D,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends (aggregate: any, event: $D) => Aggregate = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aggregate: any,
    event: $D,
  ) => Aggregate,
  A extends Aggregate = ReturnType<R>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $A extends Aggregate = Aggregate extends A ? any : A,
> {
  // @ts-ignore _types only
  _types: {
    details: D;
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
    indexedEvents: Record<string, Omit<$D, 'version'>>,
    event: $D,
  ) => Record<string, Omit<D, 'version'>>;
  snapshotInterval: number;

  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: D[] }>;
  pushEvent: (eventDetail: $D) => Promise<void>;
  listAggregateIds: (
    listAggregateOptions?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;

  buildAggregate: (events: $D[], aggregate?: $A) => A | undefined;

  getAggregate: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{
    aggregate: A | undefined;
    events: D[];
    lastEvent: D | undefined;
    snapshot: A | undefined;
  }>;
  getExistingAggregate: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{
    aggregate: A;
    events: D[];
    lastEvent: D;
    snapshot: A | undefined;
  }>;
  simulateAggregate: (
    events: $D[],
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
    snapshotInterval = Infinity,
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
      indexedEvents: Record<string, Omit<$D, 'version'>>,
      event: $D,
    ) => Record<string, Omit<D, 'version'>>;
    storageAdapter?: StorageAdapter;
    snapshotInterval?: number;
  }) {
    this.eventStoreId = eventStoreId;
    this.eventStoreEvents = eventStoreEvents;
    this.reduce = reduce;
    this.simulateSideEffect = simulateSideEffect;
    /**
     * @debt v2 "rename as eventStorageAdapter"
     */
    this.storageAdapter = storageAdapter;

    if (
      snapshotInterval !== Infinity &&
      (!Number.isInteger(snapshotInterval) || snapshotInterval <= 1)
    ) {
      throw new InvalidSnapshotIntervalError({ snapshotInterval });
    }
    this.snapshotInterval = snapshotInterval;

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
      ) as Promise<{ events: D[] }>;
    };

    this.pushEvent = async (eventDetail: $D) => {
      if (!this.storageAdapter) {
        throw new UndefinedStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      await this.storageAdapter.pushEvent(eventDetail, {
        eventStoreId: this.eventStoreId,
      });

      const { version, aggregateId } = eventDetail;
      if (version % this.snapshotInterval === 0) {
        /**
         * @debt performances "In theory, events should already have been fetched. Find a way to not have to refetch aggregate (caching or input)"
         */
        const { aggregate } = await this.getAggregate(aggregateId);

        if (!aggregate) {
          console.error('Unable to create snapshot: Aggregate not found');

          return;
        }

        await this.storageAdapter.putSnapshot(aggregate);
      }
    };

    this.listAggregateIds = async (options?: ListAggregateIdsOptions) => {
      if (!this.storageAdapter) {
        throw new UndefinedStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      return this.storageAdapter.listAggregateIds(options);
    };

    this.buildAggregate = (eventDetails: $D[], aggregate?: $A) =>
      eventDetails.reduce(this.reduce, aggregate) as A | undefined;

    this.getAggregate = async (aggregateId, options = {}) => {
      if (!this.storageAdapter) {
        throw new UndefinedStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      const { maxVersion } = options;
      let snapshot: A | undefined;
      if (maxVersion === undefined || maxVersion >= this.snapshotInterval) {
        snapshot = (
          await this.storageAdapter.getLastSnapshot(aggregateId, { maxVersion })
        ).snapshot as A | undefined;
      }

      const { events } = await this.getEvents(aggregateId, {
        ...options,
        minVersion: snapshot ? snapshot.version + 1 : undefined,
      });

      const aggregate = this.buildAggregate(
        events as unknown as $D[],
        snapshot as unknown as $A,
      );

      const lastEvent = events[events.length - 1];

      return { aggregate, events, lastEvent, snapshot };
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
        events.reduce(
          this.simulateSideEffect as unknown as (
            indexedEvents: Record<string, Omit<$D, 'version'>>,
            event: $D,
          ) => Record<string, Omit<$D, 'version'>>,
          {} as Record<string, $D>,
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
        .map((event, index) => ({ ...event, version: index + 1 })) as $D[];

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
