import { Entity, QueryOptions, Table } from 'dynamodb-toolbox';

import { Aggregate } from './aggregate';
import { DocumentClient } from './documentClient';
import { EventDetail } from './event/eventDetail';
import { EventType, EventTypeDetail } from './event/eventType';
import { EVENT_TABLE_PK, EVENT_TABLE_SK } from './eventTableKeys';

type EventsQueryOptions = { maxVersion?: number };

type SimulationOptions = {
  simulationDate?: string;
};

export class EventStore<
  E extends EventType = EventType,
  D extends EventDetail = E extends infer U
    ? U extends EventType
      ? EventTypeDetail<U>
      : never
    : never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends (aggregate: any, event: D) => Aggregate = (
    aggregate: unknown,
    event: D,
  ) => Aggregate,
  A extends Aggregate = ReturnType<R>,
> {
  _types?: { details?: D };
  eventStoreId: string;
  eventStoreEvents: E[];
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
  tableName: string;
  tableEventStreamArn: string;
  table: Table<string, typeof EVENT_TABLE_PK, typeof EVENT_TABLE_SK>;

  constructor({
    eventStoreId,
    eventStoreEvents,
    reduce,
    simulateSideEffect = (indexedEvents, event) => ({
      ...indexedEvents,
      [event.version]: event,
    }),
    tableName,
    tableEventStreamArn,
  }: {
    eventStoreId: string;
    eventStoreEvents: E[];
    reduce: R;
    simulateSideEffect?: (
      indexedEvents: Record<string, Omit<D, 'version'>>,
      event: D,
    ) => Record<string, Omit<D, 'version'>>;
    tableName: string;
    tableEventStreamArn: string;
  }) {
    this.eventStoreId = eventStoreId;
    this.eventStoreEvents = eventStoreEvents;
    this.reduce = reduce;
    this.simulateSideEffect = simulateSideEffect;
    this.tableName = tableName;
    this.tableEventStreamArn = tableEventStreamArn;

    this.table = new Table({
      name: tableName,
      partitionKey: EVENT_TABLE_PK,
      sortKey: EVENT_TABLE_SK,
      attributes: {
        [EVENT_TABLE_PK]: 'string',
        [EVENT_TABLE_SK]: 'number',
      },
      autoExecute: true,
      autoParse: true,
      DocumentClient,
    });

    const entity = new Entity({
      name: eventStoreId,
      attributes: {
        aggregateId: { type: 'string', partitionKey: true },
        version: { type: 'number', sortKey: true },
        type: { type: 'string', required: true },
        timestamp: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
        },
        payload: { type: 'map' },
      },
      table: this.table,
    } as const);

    this.pushEvent = async (event: D) => {
      await entity.put(event, {
        conditions: { attr: 'version', exists: false },
      });
    };

    this.pushEventTransaction = (event: D) =>
      entity.putTransaction(event, {
        conditions: { attr: 'version', exists: false },
      });

    this.buildAggregate = (events: D[]) =>
      events.reduce(this.reduce, undefined as unknown as A) as A | undefined;

    this.getEvents = async (aggregateId, { maxVersion } = {}) => {
      const queryOptions: QueryOptions<typeof entity> = {
        consistent: true,
      };

      if (maxVersion !== undefined) {
        queryOptions.lte = maxVersion;
      }

      const { Items = [] } = await entity.query(aggregateId, queryOptions);

      return Items as D[];
    };

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

export type EventStoreEventsDetails<S extends EventStore> = Exclude<
  Exclude<S['_types'], undefined>['details'],
  undefined
>;
