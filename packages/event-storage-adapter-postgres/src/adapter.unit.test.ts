/* eslint-disable max-lines */
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { randomUUID } from 'crypto';
import omit from 'lodash.omit';

import { GroupedEvent, EventStorageAdapter } from '@castore/core';

import { PostgresEventStorageAdapter } from './adapter';
import { PostgresEventAlreadyExistsError } from './error';

const eventStoreId = 'eventStoreId';

const aggregateIdMock1 = randomUUID();
const aggregate1InitialEventTimestamp = '2021-01-01T00:00:00.000Z';
const aggregateIdMock2 = randomUUID();
const aggregate2InitialEventTimestamp = '2022-01-01T00:00:00.000Z';
const aggregateIdMock3 = randomUUID();
const aggregate3InitialEventTimestamp = '2023-01-01T00:00:00.000Z';
const aggregateIdMock4 = randomUUID();
const aggregate4InitialEventTimestamp = '2024-01-01T00:00:00.000Z';
const eventMock1 = {
  aggregateId: aggregateIdMock1,
  version: 1,
  type: 'EVENT_TYPE',
  timestamp: aggregate1InitialEventTimestamp,
};
const eventMock2 = {
  aggregateId: aggregateIdMock1,
  version: 2,
  type: 'EVENT_TYPE',
  timestamp: aggregate2InitialEventTimestamp,
};

let pgInstance: StartedPostgreSqlContainer;
let connectionString: string;
let eventStorageAdapter: PostgresEventStorageAdapter;
let eventStorageAdapterB: PostgresEventStorageAdapter;
beforeAll(async () => {
  const pgInstanceNotReady = new PostgreSqlContainer('postgres:15.3-alpine');
  pgInstance = await pgInstanceNotReady.start();
  connectionString = pgInstance.getConnectionUri();
  eventStorageAdapter = new PostgresEventStorageAdapter({
    connectionString,
  });
  eventStorageAdapterB = new PostgresEventStorageAdapter({
    connectionString,
  });
});

beforeEach(async () => {
  await PostgresEventStorageAdapter.createEventTable({ connectionString });
});

afterEach(async () => {
  await PostgresEventStorageAdapter.dropEventTable({ connectionString });
});

afterAll(async () => {
  await pgInstance.stop();
});

describe('postgres storage adapter', () => {
  describe('methods', () => {
    describe('getEvents / pushEvent', () => {
      it('gets an empty array if there is no event for aggregateId', async () => {
        const response = await eventStorageAdapter.getEvents(aggregateIdMock1, {
          eventStoreId,
        });
        expect(response).toStrictEqual({ events: [] });
      });

      it('throws an error if version already exists', async () => {
        await eventStorageAdapter.pushEvent(eventMock1, {
          eventStoreId,
        });

        await expect(() =>
          eventStorageAdapter.pushEvent(eventMock1, { eventStoreId }),
        ).rejects.toThrow(PostgresEventAlreadyExistsError);
      });

      it('overrides event is force option is set to true', async () => {
        const { event } = await eventStorageAdapter.pushEvent(eventMock1, {
          eventStoreId,
          force: true,
        });

        expect(event).toStrictEqual(eventMock1);
      });

      it('pushes and gets events correctly', async () => {
        await eventStorageAdapter.pushEvent(eventMock1, {
          eventStoreId,
        });
        await eventStorageAdapter.pushEvent(eventMock2, {
          eventStoreId,
        });

        const allEvents = await eventStorageAdapter.getEvents(
          aggregateIdMock1,
          {
            eventStoreId,
          },
        );

        expect(allEvents).toStrictEqual({ events: [eventMock1, eventMock2] });

        const eventsMaxVersion = await eventStorageAdapter.getEvents(
          aggregateIdMock1,
          { eventStoreId },
          { maxVersion: 1 },
        );
        expect(eventsMaxVersion).toStrictEqual({ events: [eventMock1] });

        const eventsMinVersion = await eventStorageAdapter.getEvents(
          aggregateIdMock1,
          { eventStoreId },
          { minVersion: 2 },
        );
        expect(eventsMinVersion).toStrictEqual({ events: [eventMock2] });

        const eventsLimit = await eventStorageAdapter.getEvents(
          aggregateIdMock1,
          { eventStoreId },
          { limit: 1 },
        );
        expect(eventsLimit).toStrictEqual({ events: [eventMock1] });

        const eventsReverse = await eventStorageAdapter.getEvents(
          aggregateIdMock1,
          { eventStoreId },
          { reverse: true },
        );
        expect(eventsReverse).toStrictEqual({
          events: [eventMock2, eventMock1],
        });

        const eventsReverseAndLimit = await eventStorageAdapter.getEvents(
          aggregateIdMock1,
          { eventStoreId },
          { limit: 1, reverse: true },
        );
        expect(eventsReverseAndLimit).toStrictEqual({ events: [eventMock2] });
      });
    });

    describe('listAggregateIds', () => {
      it('list aggregate Ids', async () => {
        await eventStorageAdapter.pushEvent(eventMock1, { eventStoreId });
        await eventStorageAdapter.pushEvent(
          {
            aggregateId: aggregateIdMock2,
            version: 1,
            type: 'EVENT_TYPE',
            timestamp: aggregate2InitialEventTimestamp,
          },
          { eventStoreId },
        );

        const aggregateIds = await eventStorageAdapter.listAggregateIds({
          eventStoreId,
        });

        expect(aggregateIds).toStrictEqual({
          aggregateIds: [
            {
              aggregateId: aggregateIdMock1,
              initialEventTimestamp: aggregate1InitialEventTimestamp,
            },
            {
              aggregateId: aggregateIdMock2,
              initialEventTimestamp: aggregate2InitialEventTimestamp,
            },
          ],
        });
      });

      it('paginates aggregate Ids', async () => {
        await eventStorageAdapter.pushEvent(eventMock1, { eventStoreId });
        await eventStorageAdapter.pushEvent(
          {
            aggregateId: aggregateIdMock2,
            version: 1,
            type: 'EVENT_TYPE',
            timestamp: aggregate2InitialEventTimestamp,
          },
          { eventStoreId },
        );
        await eventStorageAdapter.pushEvent(
          {
            aggregateId: aggregateIdMock3,
            version: 1,
            type: 'EVENT_TYPE',
            timestamp: aggregate3InitialEventTimestamp,
          },
          { eventStoreId },
        );

        await eventStorageAdapter.pushEvent(
          {
            aggregateId: aggregateIdMock4,
            version: 1,
            type: 'EVENT_TYPE',
            timestamp: aggregate4InitialEventTimestamp,
          },
          { eventStoreId },
        );

        const { aggregateIds, nextPageToken } =
          await eventStorageAdapter.listAggregateIds(
            { eventStoreId },
            { limit: 2 },
          );

        expect(aggregateIds).toStrictEqual([
          {
            aggregateId: aggregateIdMock1,
            initialEventTimestamp: aggregate1InitialEventTimestamp,
          },
          {
            aggregateId: aggregateIdMock2,
            initialEventTimestamp: aggregate2InitialEventTimestamp,
          },
        ]);

        expect(JSON.parse(nextPageToken as string)).toStrictEqual({
          limit: 2,
          lastEvaluatedKey: {
            aggregateId: aggregateIdMock2,
            initialEventTimestamp: aggregate2InitialEventTimestamp,
          },
        });

        const lastAggregateIds = await eventStorageAdapter.listAggregateIds(
          { eventStoreId },
          { pageToken: nextPageToken },
        );

        expect(lastAggregateIds).toStrictEqual({
          aggregateIds: [
            {
              aggregateId: aggregateIdMock3,
              initialEventTimestamp: aggregate3InitialEventTimestamp,
            },
            {
              aggregateId: aggregateIdMock4,
              initialEventTimestamp: aggregate4InitialEventTimestamp,
            },
          ],
        });
      });

      it('applies lisAggregateIds options', async () => {
        await eventStorageAdapter.pushEvent(eventMock1, { eventStoreId });
        await eventStorageAdapter.pushEvent(
          {
            aggregateId: aggregateIdMock2,
            version: 1,
            type: 'EVENT_TYPE',
            timestamp: aggregate2InitialEventTimestamp,
          },
          { eventStoreId },
        );

        await eventStorageAdapter.pushEvent(
          {
            aggregateId: aggregateIdMock3,
            version: 1,
            type: 'EVENT_TYPE',
            timestamp: aggregate3InitialEventTimestamp,
          },
          { eventStoreId },
        );

        await eventStorageAdapter.pushEvent(
          {
            aggregateId: aggregateIdMock4,
            version: 1,
            type: 'EVENT_TYPE',
            timestamp: aggregate4InitialEventTimestamp,
          },
          { eventStoreId },
        );

        const { aggregateIds, nextPageToken } =
          await eventStorageAdapter.listAggregateIds(
            { eventStoreId },
            {
              limit: 1,
              initialEventAfter: '2021-02-01T00:00:00.000Z',
              initialEventBefore: '2023-02-01T00:00:00.000Z',
              reverse: true,
            },
          );

        expect(aggregateIds).toStrictEqual([
          {
            aggregateId: aggregateIdMock3,
            initialEventTimestamp: aggregate3InitialEventTimestamp,
          },
        ]);
        expect(JSON.parse(nextPageToken as string)).toStrictEqual({
          limit: 1,
          initialEventAfter: '2021-02-01T00:00:00.000Z',
          initialEventBefore: '2023-02-01T00:00:00.000Z',
          reverse: true,
          lastEvaluatedKey: {
            aggregateId: aggregateIdMock3,
            initialEventTimestamp: aggregate3InitialEventTimestamp,
          },
        });

        const { aggregateIds: lastAggregateIds, nextPageToken: noPageToken } =
          await eventStorageAdapter.listAggregateIds(
            { eventStoreId },
            { pageToken: nextPageToken },
          );

        expect(noPageToken).toBeUndefined();
        expect(lastAggregateIds).toStrictEqual([
          {
            aggregateId: aggregateIdMock2,
            initialEventTimestamp: aggregate2InitialEventTimestamp,
          },
        ]);
      });
    });

    describe('groupEvent', () => {
      it('groups events correctly', () => {
        const groupedEvent = eventStorageAdapter.groupEvent(
          omit(eventMock1, 'timestamp'),
        );

        expect(groupedEvent).toBeInstanceOf(GroupedEvent);
        expect(groupedEvent).toMatchObject({
          event: omit(eventMock1, 'timestamp'),
          eventStorageAdapter: eventStorageAdapter,
        });
      });
    });
  });

  describe('pushEventGroup', () => {
    // @ts-expect-error we don't care about the storage adapter, it just needs to not be an instance of PostgresEventStorageAdapter
    const eventStorageAdapterC: EventStorageAdapter = {};
    eventStorageAdapterC;

    const aggregate2EventMock = {
      aggregateId: aggregateIdMock2,
      version: 1,
      type: 'EVENT_TYPE',
      timestamp: eventMock1.timestamp,
    };

    beforeEach(async () => {
      await PostgresEventStorageAdapter.dropEventTable({ connectionString });
      await PostgresEventStorageAdapter.createEventTable({ connectionString });
    });

    it('push grouped events correctly', async () => {
      const groupedEvents: [GroupedEvent, ...GroupedEvent[]] = [
        new GroupedEvent({
          event: eventMock1,
          eventStorageAdapter: eventStorageAdapter,
          context: { eventStoreId },
        }),
        new GroupedEvent({
          event: aggregate2EventMock,
          eventStorageAdapter: eventStorageAdapterB,
          context: { eventStoreId },
        }),
      ];

      const eventGroup = await eventStorageAdapter.pushEventGroup(
        { force: true },
        ...groupedEvents,
      );
      expect(eventGroup).toStrictEqual({
        eventGroup: [{ event: eventMock1 }, { event: aggregate2EventMock }],
      });

      const { events: eventsA } = await eventStorageAdapter.getEvents(
        aggregateIdMock1,
        { eventStoreId },
      );
      expect(eventsA).toStrictEqual([eventMock1]);

      const { events: eventsB } = await eventStorageAdapterB.getEvents(
        aggregateIdMock2,
        { eventStoreId },
      );
      expect(eventsB).toStrictEqual([aggregate2EventMock]);
    });

    it('throws if event storage adapter is not PostgresEventStorageAdapter', async () => {
      const groupedEvents: [GroupedEvent, ...GroupedEvent[]] = [
        new GroupedEvent({
          event: eventMock1,
          eventStorageAdapter: eventStorageAdapter,
          context: { eventStoreId },
        }),
        new GroupedEvent({
          event: aggregate2EventMock,
          eventStorageAdapter: eventStorageAdapterC,
          context: { eventStoreId },
        }),
      ];

      await expect(() =>
        eventStorageAdapter.pushEventGroup({}, ...groupedEvents),
      ).rejects.toThrow();
    });

    it('throws if context is missing', async () => {
      const groupedEvents: [GroupedEvent, ...GroupedEvent[]] = [
        new GroupedEvent({
          event: eventMock1,
          eventStorageAdapter: eventStorageAdapter,
          context: { eventStoreId },
        }),
        new GroupedEvent({
          event: aggregate2EventMock,
          eventStorageAdapter: eventStorageAdapterB,
        }),
      ];

      await expect(() =>
        eventStorageAdapter.pushEventGroup({}, ...groupedEvents),
      ).rejects.toThrow();
    });

    it('throws if events have different timestamps', async () => {
      const groupedEvents: [GroupedEvent, ...GroupedEvent[]] = [
        new GroupedEvent({
          event: eventMock1,
          eventStorageAdapter: eventStorageAdapter,
          context: { eventStoreId },
        }),
        new GroupedEvent({
          event: {
            ...aggregate2EventMock,
            timestamp: new Date().toISOString(),
          },
          eventStorageAdapter: eventStorageAdapterB,
        }),
      ];

      await expect(() =>
        eventStorageAdapter.pushEventGroup({}, ...groupedEvents),
      ).rejects.toThrow();
    });

    it('reverts all events if a push has failed', async () => {
      await eventStorageAdapter.pushEvent(eventMock1, { eventStoreId });
      const groupedEvents: [GroupedEvent, ...GroupedEvent[]] = [
        new GroupedEvent({
          event: eventMock1,
          eventStorageAdapter: eventStorageAdapter,
          context: { eventStoreId },
        }),
        new GroupedEvent({
          event: aggregate2EventMock,
          eventStorageAdapter: eventStorageAdapterB,
          context: { eventStoreId },
        }),
      ];

      await expect(() =>
        eventStorageAdapter.pushEventGroup({}, ...groupedEvents),
      ).rejects.toThrow();

      const { events: eventsA } = await eventStorageAdapter.getEvents(
        aggregateIdMock1,
        { eventStoreId },
      );
      expect(eventsA).toStrictEqual([eventMock1]);

      const { events: eventsB } = await eventStorageAdapterB.getEvents(
        aggregateIdMock2,
        { eventStoreId },
      );
      expect(eventsB).toStrictEqual([]);
    });
  });
});
