/* eslint-disable max-lines */
import type { Aggregate } from '~/aggregate';
import { AggregateNotFoundError } from '~/errors/aggregateNotFound';
import { UndefinedStorageAdapterError } from '~/errors/undefinedStorageAdapterError';
import type { EventDetail } from '~/event/eventDetail';
import type { EventType, EventTypesDetails } from '~/event/eventType';
import type { StorageAdapter } from '~/storageAdapter';

import {
  AggregateIdsLister,
  EventPusher,
  EventsGetter,
  SideEffectsSimulator,
  AggregateGetter,
  AggregateSimulator,
} from './types';
import { validateSnapshotInterval } from './utils/validateSnapshotInterval';

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
  simulateSideEffect: SideEffectsSimulator<D, $D>;
  snapshotInterval: number;

  getEvents: EventsGetter<D>;
  pushEvent: EventPusher<$D>;
  listAggregateIds: AggregateIdsLister;

  buildAggregate: (events: $D[], aggregate?: $A) => A | undefined;

  getAggregate: AggregateGetter<D, A>;
  getExistingAggregate: AggregateGetter<D, A, true>;
  simulateAggregate: AggregateSimulator<$D, A>;
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
    simulateSideEffect?: SideEffectsSimulator<D, $D>;
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
    this.storageAdapter = $storageAdapter;

    this.snapshotInterval = validateSnapshotInterval(snapshotInterval);

    this.getStorageAdapter = () => {
      if (!this.storageAdapter) {
        throw new UndefinedStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      return this.storageAdapter;
    };

    this.getEvents = async (aggregateId, queryOptions) =>
      this.getStorageAdapter().getEvents(
        aggregateId,
        queryOptions,
        /**
         * @debt feature "For the moment we just cast, we could implement validation + type guards at EventType level"
         */
      ) as Promise<{ events: D[] }>;

    this.pushEvent = async eventDetail => {
      const storageAdapter = this.getStorageAdapter();

      await storageAdapter.pushEvent(eventDetail, {
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

        await storageAdapter.putSnapshot(aggregate);
      }
    };

    this.listAggregateIds = async options =>
      this.getStorageAdapter().listAggregateIds(options);

    this.buildAggregate = (eventDetails, aggregate) =>
      eventDetails.reduce(this.reduce, aggregate) as A | undefined;

    this.getAggregate = async (aggregateId, options = {}) => {
      const { maxVersion } = options;

      let snapshot: A | undefined;
      if (maxVersion === undefined || maxVersion >= this.snapshotInterval) {
        snapshot = (
          await this.getStorageAdapter().getLastSnapshot(aggregateId, {
            maxVersion,
          })
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

    this.simulateAggregate = (events, { simulationDate } = {}) => {
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
