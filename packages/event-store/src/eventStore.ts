import { Aggregate } from './aggregate';
import { EventDetail } from './event/eventDetail';
import { EventType, EventTypesDetails } from './event/eventType';
import {
  EventsQueryOptions,
  StorageAdapter,
} from './storageAdapter/storageAdapter';

export type SimulationOptions = { simulationDate?: string };

export class EventStore<
  E extends EventType[] = EventType[],
  D extends EventDetail = EventTypesDetails<E>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends (aggregate: any, event: D) => Aggregate = (
    aggregate: unknown,
    event: D,
  ) => Aggregate,
  A extends Aggregate = ReturnType<R>,
> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  _types: { details: D };
  eventStoreId: string;
  eventStoreEvents: E;
  reduce: R;
  pushEvent: (eventDetail: D) => Promise<void>;
  simulateSideEffect: (
    indexedEvents: Record<string, Omit<D, 'version'>>,
    event: D,
  ) => Record<string, Omit<D, 'version'>>;

  pushEventTransaction: (eventDetail: D) => unknown;
  buildAggregate: (events: D[]) => A | undefined;
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<D[]>;
  getAggregate: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{
    aggregate: A | undefined;
    events: D[];
    lastEvent: D | undefined;
  }>;
  simulateAggregate: (
    events: D[],
    options?: SimulationOptions,
  ) => A | undefined;
  storageAdapter: StorageAdapter;

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
    eventStoreId: string;
    eventStoreEvents: E;
    reduce: R;
    storageAdapter: StorageAdapter;
    simulateSideEffect?: (
      indexedEvents: Record<string, Omit<D, 'version'>>,
      event: D,
    ) => Record<string, Omit<D, 'version'>>;
  }) {
    this.eventStoreId = eventStoreId;
    this.eventStoreEvents = eventStoreEvents;
    this.reduce = reduce;
    this.simulateSideEffect = simulateSideEffect;
    this.storageAdapter = storageAdapter;

    this.pushEvent = async (eventDetail: D) =>
      this.storageAdapter.pushEvent(eventDetail);

    this.pushEventTransaction = (eventDetail: D) =>
      this.storageAdapter.pushEventTransaction(eventDetail);

    this.buildAggregate = (eventDetails: D[]) =>
      eventDetails.reduce(this.reduce, undefined as unknown as A) as
        | A
        | undefined;

    this.getEvents = async (aggregateId, queryOptions) =>
      /**
       * @debt feature "For the moment we just cast, we could implement validation + type guards at EventType level"
       */
      this.storageAdapter.getEvents(aggregateId, queryOptions) as Promise<D[]>;

    this.getAggregate = async (aggregateId, options) => {
      const events = await this.getEvents(aggregateId, options);
      const aggregate = this.buildAggregate(events);
      const lastEvent = events[events.length - 1];

      return { aggregate, events, lastEvent };
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
