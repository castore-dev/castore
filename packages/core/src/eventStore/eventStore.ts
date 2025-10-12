/* eslint-disable max-lines */
import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type { EventType, EventTypeDetails } from '~/event/eventType';
import { GroupedEvent } from '~/event/groupedEvent';
import type { EventStorageAdapter } from '~/eventStorageAdapter';
import { SnapshotConfig, Snapshot, SnapshotStorageAdapter } from '~/snapshot';
import type { $Contravariant } from '~/utils';

import { AggregateNotFoundError } from './errors/aggregateNotFound';
import { UndefinedEventStorageAdapterError } from './errors/undefinedEventStorageAdapter';
import {
  AggregateIdsLister,
  EventPusher,
  OnEventPushed,
  EventGroupPusher,
  EventGroupPusherResponse,
  EventsGetter,
  EventGrouper,
  SideEffectsSimulator,
  AggregateGetter,
  AggregateSimulator,
  Reducer,
  AggregateAsSnapshotSaver,
  SnapshotGetter,
} from './types';

export class EventStore<
  EVENT_STORE_ID extends string = string,
  EVENT_TYPES extends EventType[] = EventType[],
  EVENT_DETAILS extends EventDetail = EventTypeDetails<EVENT_TYPES>,
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
  static pushEventGroup: EventGroupPusher = async <
    GROUPED_EVENTS extends [GroupedEvent, ...GroupedEvent[]],
    OPTIONS_OR_GROUPED_EVENTS_HEAD extends
      | GroupedEvent
      | { force?: boolean } = GroupedEvent,
  >(
    optionsOrGroupedEvent: OPTIONS_OR_GROUPED_EVENTS_HEAD,
    ..._groupedEvents: GROUPED_EVENTS
  ) => {
    const groupedEvents = (
      optionsOrGroupedEvent instanceof GroupedEvent
        ? [optionsOrGroupedEvent, ..._groupedEvents]
        : _groupedEvents
    ) as [GroupedEvent, ...GroupedEvent[]];

    const options = (
      optionsOrGroupedEvent instanceof GroupedEvent ? {} : optionsOrGroupedEvent
    ) as { force?: boolean };

    const [groupedEventsHead] = groupedEvents;

    const { eventGroup: eventGroupWithoutAggregates } =
      await groupedEventsHead.eventStorageAdapter.pushEventGroup(
        options,
        ...groupedEvents,
      );

    const eventGroupWithAggregates = eventGroupWithoutAggregates.map(
      ({ event }, eventIndex) => {
        const groupedEvent = groupedEvents[eventIndex];

        let nextAggregate: Aggregate | undefined = undefined;
        const prevAggregate = groupedEvent?.prevAggregate;

        if (
          (prevAggregate !== undefined || event.version === 1) &&
          groupedEvent?.eventStore !== undefined
        ) {
          nextAggregate = groupedEvent.eventStore.reducer(prevAggregate, event);
        }

        return {
          event,
          ...(nextAggregate !== undefined ? { nextAggregate } : {}),
        };
      },
    );

    await Promise.all(
      groupedEvents.map((groupedEvent, eventIndex) => {
        const eventStore = groupedEvent.eventStore;
        const pushEventResponse = eventGroupWithAggregates[eventIndex];

        return pushEventResponse !== undefined &&
          eventStore?.onEventPushed !== undefined
          ? eventStore.onEventPushed(pushEventResponse)
          : null;
      }),
    );

    return { eventGroup: eventGroupWithAggregates } as {
      eventGroup: OPTIONS_OR_GROUPED_EVENTS_HEAD extends GroupedEvent
        ? EventGroupPusherResponse<
            [OPTIONS_OR_GROUPED_EVENTS_HEAD, ...GROUPED_EVENTS]
          >
        : EventGroupPusherResponse<GROUPED_EVENTS>;
    };
  };

  _types?: {
    details: EVENT_DETAILS;
    aggregate: AGGREGATE;
  };
  eventStoreId: EVENT_STORE_ID;
  eventTypes: EVENT_TYPES;
  reducer: REDUCER;
  simulateSideEffect: SideEffectsSimulator<EVENT_DETAILS, $EVENT_DETAILS>;

  getEvents: EventsGetter<EVENT_DETAILS>;
  pushEvent: EventPusher<EVENT_DETAILS, $EVENT_DETAILS, AGGREGATE, $AGGREGATE>;
  onEventPushed?: OnEventPushed<$EVENT_DETAILS, $AGGREGATE>;
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
  eventStorageAdapter?: EventStorageAdapter;
  getEventStorageAdapter: () => EventStorageAdapter;

  snapshotConfig?: SnapshotConfig<AGGREGATE, $AGGREGATE>;
  snapshotStorageAdapter?: SnapshotStorageAdapter<AGGREGATE, $AGGREGATE>;
  getSnapshot: SnapshotGetter<AGGREGATE>;
  saveAggregateAsSnapshot: AggregateAsSnapshotSaver<$AGGREGATE>;

  constructor({
    eventStoreId,
    eventTypes,
    reducer,
    simulateSideEffect = (indexedEvents, event) => ({
      ...indexedEvents,
      [event.version]: event,
    }),
    onEventPushed,
    eventStorageAdapter,
    snapshotConfig,
    snapshotStorageAdapter,
  }: {
    eventStoreId: EVENT_STORE_ID;
    eventTypes: EVENT_TYPES;
    reducer: REDUCER;
    simulateSideEffect?: SideEffectsSimulator<EVENT_DETAILS, $EVENT_DETAILS>;
    onEventPushed?: OnEventPushed<$EVENT_DETAILS, $AGGREGATE>;
    eventStorageAdapter?: EventStorageAdapter;
    snapshotConfig?: SnapshotConfig<AGGREGATE, $AGGREGATE>;
    snapshotStorageAdapter?: SnapshotStorageAdapter<AGGREGATE, $AGGREGATE>;
  }) {
    this.eventStoreId = eventStoreId;
    this.eventTypes = eventTypes;
    this.reducer = reducer;
    this.simulateSideEffect = simulateSideEffect;
    this.onEventPushed = onEventPushed;
    this.eventStorageAdapter = eventStorageAdapter;
    this.snapshotConfig = snapshotConfig;
    this.snapshotStorageAdapter = snapshotStorageAdapter;

    this.getEventStorageAdapter = () => {
      if (this.eventStorageAdapter === undefined) {
        throw new UndefinedEventStorageAdapterError({
          eventStoreId: this.eventStoreId,
        });
      }

      return this.eventStorageAdapter;
    };

    this.getEvents = (aggregateId, queryOptions) =>
      this.getEventStorageAdapter().getEvents(
        aggregateId,
        { eventStoreId: this.eventStoreId },
        queryOptions,
        /**
         * @debt feature "For the moment we just cast, we could implement validation + type guards at EventType level"
         */
      ) as Promise<{ events: EVENT_DETAILS[] }>;

    this.pushEvent = async (
      eventDetail,
      { prevAggregate, force = false } = {},
    ) => {
      const { event } = (await this.getEventStorageAdapter().pushEvent(
        eventDetail,
        { eventStoreId: this.eventStoreId, force },
      )) as { event: $EVENT_DETAILS };

      let nextAggregate: AGGREGATE | undefined = undefined;
      if (prevAggregate !== undefined || event.version === 1) {
        nextAggregate = this.reducer(prevAggregate, event) as AGGREGATE;
      }

      const response = {
        event: event as unknown as EVENT_DETAILS,
        ...(nextAggregate !== undefined ? { nextAggregate } : {}),
      };

      if (this.onEventPushed !== undefined) {
        await this.onEventPushed(
          response as unknown as {
            event: $EVENT_DETAILS;
            nextAggregate?: $AGGREGATE;
          },
        );
      }

      return response;
    };

    this.groupEvent = (eventDetail, { prevAggregate } = {}) => {
      const groupedEvent = this.getEventStorageAdapter().groupEvent(
        eventDetail,
      ) as GroupedEvent<EVENT_DETAILS, AGGREGATE>;

      groupedEvent.eventStore = this;
      groupedEvent.context = { eventStoreId: this.eventStoreId };

      if (prevAggregate !== undefined) {
        groupedEvent.prevAggregate = prevAggregate as unknown as AGGREGATE;
      }

      return groupedEvent;
    };

    this.listAggregateIds = options =>
      this.getEventStorageAdapter().listAggregateIds(
        { eventStoreId: this.eventStoreId },
        options,
      );

    this.buildAggregate = (eventDetails, aggregate) =>
      eventDetails.reduce(this.reducer, aggregate) as AGGREGATE | undefined;

    this.getSnapshot = async (aggregateId, { maxVersion } = {}) => {
      if (this.snapshotConfig === undefined) {
        throw new Error(
          `snapshotConfig is required in eventStore "${this.eventStoreId}" to use getAggregateFromSnapshot`,
        );
      }
      if (this.snapshotStorageAdapter === undefined) {
        throw new Error(
          `EventStore "${this.eventStoreId}" has a snapshotConfig but no snapshotStorageAdapter.`,
        );
      }
      const latestSnapshot = await this.snapshotStorageAdapter.getSnapshot({
        aggregateId,
        aggregateMaxVersion: maxVersion,
        eventStoreId: this.eventStoreId,
        reducerVersion:
          this.snapshotConfig.migrateSnapshotReducerVersion === undefined
            ? this.snapshotConfig.currentReducerVersion
            : undefined,
      });

      if (latestSnapshot === undefined) {
        return undefined;
      }

      if (
        latestSnapshot.reducerVersion ===
        this.snapshotConfig.currentReducerVersion
      ) {
        return latestSnapshot;
      }

      if (this.snapshotConfig.migrateSnapshotReducerVersion === undefined) {
        throw new Error(
          `snapshotStorageAdapter of eventStore "${this.eventStoreId}" returned a snapshot with a reducerVersion ("${latestSnapshot.reducerVersion}") different from the currentReducerVersion ("${this.snapshotConfig.currentReducerVersion}"). This is not supposed to happen`,
        );
      }

      return this.snapshotConfig.migrateSnapshotReducerVersion(
        latestSnapshot as unknown as Snapshot<$AGGREGATE>,
      );
    };

    this.saveAggregateAsSnapshot = async (aggregate, previousSnapshot) => {
      if (this.snapshotConfig === undefined) {
        throw new Error(
          `snapshotConfig is required in eventStore "${this.eventStoreId}" to use saveAggregateAsSnapshot`,
        );
      }
      if (this.snapshotStorageAdapter === undefined) {
        throw new Error(
          `EventStore "${this.eventStoreId}" has a snapshotConfig but no snapshotStorageAdapter.`,
        );
      }

      const snapshot = {
        aggregate,
        eventStoreId: this.eventStoreId,
        reducerVersion: this.snapshotConfig.currentReducerVersion,
      };

      await this.snapshotStorageAdapter.saveSnapshot(snapshot);

      await this.snapshotConfig.cleanUpAfterSnapshotSave?.({
        latestSnapshot: snapshot,
        previousSnapshot,
        snapshotStorageAdapter: this
          .snapshotStorageAdapter as unknown as SnapshotStorageAdapter<
          $AGGREGATE,
          $AGGREGATE
        >,
      });
    };

    this.getAggregate = async (
      aggregateId,
      { maxVersion, useSnapshot } = {},
    ) => {
      const snapshot =
        useSnapshot === true
          ? await this.getSnapshot(aggregateId, { maxVersion })
          : undefined;
      const minVersion =
        snapshot !== undefined ? snapshot.aggregate.version + 1 : undefined;

      const { events } = await this.getEvents(aggregateId, {
        maxVersion,
        minVersion,
      });

      const aggregate = this.buildAggregate(
        events as unknown as $EVENT_DETAILS[],
        snapshot?.aggregate as unknown as $AGGREGATE | undefined,
      );

      if (
        aggregate !== undefined &&
        this.snapshotConfig?.shouldSaveSnapshot({
          aggregate: aggregate as unknown as $AGGREGATE | undefined,
          previousSnapshot: snapshot as Snapshot<$AGGREGATE> | undefined,
        }) === true
      ) {
        await this.saveAggregateAsSnapshot(
          aggregate as unknown as $AGGREGATE,
          snapshot as Snapshot<$AGGREGATE> | undefined,
        );
      }

      const lastEvent =
        events.length > 0 ? events[events.length - 1] : undefined;

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
