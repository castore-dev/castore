/* eslint-disable max-lines */
import {
  EventDetail,
  OmitTimestamp,
  GroupedEvent,
  PushEventContext,
  StorageAdapter,
} from '@castore/core';

import { InMemoryEventAlreadyExistsError } from './error';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

class InMemoryGroupedEvent extends GroupedEvent {
  constructor({
    event,
    eventStorageAdapter,
  }: {
    event: OmitTimestamp<EventDetail>;
    eventStorageAdapter: InMemoryStorageAdapter;
  }) {
    super({ event, eventStorageAdapter });
  }
}

const getInitialEventTimestamp = (
  aggregateId: string,
  events: EventDetail[],
) => {
  const initialEventTimestamp = events[0]?.timestamp;

  if (initialEventTimestamp === undefined) {
    throw new Error(
      `Unable to find initial timestamp for aggregate ${aggregateId}`,
    );
  }

  return initialEventTimestamp;
};

export class InMemoryStorageAdapter implements StorageAdapter {
  getEvents: StorageAdapter['getEvents'];
  pushEvent: StorageAdapter['pushEvent'];
  pushEventGroup: StorageAdapter['pushEventGroup'];
  groupEvent: StorageAdapter['groupEvent'];
  listAggregateIds: StorageAdapter['listAggregateIds'];
  putSnapshot: StorageAdapter['putSnapshot'];
  getLastSnapshot: StorageAdapter['getLastSnapshot'];
  listSnapshots: StorageAdapter['listSnapshots'];

  eventStore: { [aggregateId: string]: EventDetail[] };

  constructor({ initialEvents = [] }: { initialEvents?: EventDetail[] } = {}) {
    this.eventStore = {};

    initialEvents.forEach(({ aggregateId, ...restEventDetail }) => {
      const aggregateEvents = this.eventStore[aggregateId];
      if (aggregateEvents) {
        aggregateEvents.push({ aggregateId, ...restEventDetail });
      } else {
        this.eventStore[aggregateId] = [{ aggregateId, ...restEventDetail }];
      }
    });

    this.pushEvent = async (eventWithoutTimestamp, context) =>
      new Promise(resolve => {
        const timestamp = new Date().toISOString();
        const event = { ...eventWithoutTimestamp, timestamp };

        const { aggregateId, version } = event;
        const events = this.eventStore[aggregateId];

        if (events === undefined) {
          this.eventStore[aggregateId] = [event];
          resolve({ event });

          return;
        }

        if (
          events.some(
            ({ version: existingVersion }) => existingVersion === version,
          )
        ) {
          const { eventStoreId } = context;

          throw new InMemoryEventAlreadyExistsError({
            eventStoreId,
            aggregateId,
            version,
          });
        }

        events.push(event);
        resolve({ event });
      });

    this.pushEventGroup = async (...groupedEvents) => {
      groupedEvents.forEach((groupedEvent, groupedEventIndex) => {
        if (!(groupedEvent instanceof InMemoryGroupedEvent)) {
          throw new Error(
            `Event group event #${groupedEventIndex} is not connected to a InMemoryEventStorageAdapter`,
          );
        }

        if (groupedEvent.context === undefined) {
          throw new Error(
            `Event group event #${groupedEventIndex} misses context`,
          );
        }
      });

      const eventGroup: { event: EventDetail }[] = [];

      for (const groupedEvent of groupedEvents) {
        const { eventStorageAdapter, event, context } = groupedEvent;

        try {
          /**
           * @debt feature "Create and use pushEventSync method just to be sure of the transaction"
           */
          const response = await eventStorageAdapter.pushEvent(
            event,
            context as PushEventContext,
          );
          eventGroup.push(response);
        } catch (error) {
          /**
           * @debt feature "Actually rollback written events"
           */
          error;
          throw error;
        }
      }

      return { eventGroup };
    };

    this.groupEvent = event =>
      new InMemoryGroupedEvent({ event, eventStorageAdapter: this });

    this.getEvents = (
      aggregateId,
      { minVersion, maxVersion, reverse, limit } = {},
    ) =>
      new Promise(resolve => {
        let events = [...(this.eventStore[aggregateId] ?? [])];

        if (minVersion !== undefined) {
          events = events.filter(({ version }) => version >= minVersion);
        }

        if (maxVersion !== undefined) {
          events = events.filter(({ version }) => version <= maxVersion);
        }

        if (reverse === true) {
          events = events.reverse();
        }

        if (limit !== undefined) {
          events = events.slice(0, limit);
        }

        resolve({ events });
      });

    this.listAggregateIds = ({
      pageToken: inputPageToken,
      ...inputOptions
    } = {}) =>
      new Promise(resolve => {
        const {
          limit,
          initialEventAfter,
          initialEventBefore,
          reverse,
          exclusiveStartKey,
        } = parseAppliedListAggregateIdsOptions({
          inputPageToken,
          inputOptions,
        });

        let aggregateEntries = Object.entries(this.eventStore).sort(
          (entryA, entryB) => {
            const initialEventATimestamp = getInitialEventTimestamp(...entryA);
            const initialEventBTimestamp = getInitialEventTimestamp(...entryB);

            return initialEventATimestamp > initialEventBTimestamp ? 1 : -1;
          },
        );

        if (initialEventAfter !== undefined) {
          aggregateEntries = aggregateEntries.filter(entry => {
            const initialEventTimestamp = getInitialEventTimestamp(...entry);

            return initialEventTimestamp >= initialEventAfter;
          });
        }

        if (initialEventBefore !== undefined) {
          aggregateEntries = aggregateEntries.filter(entry => {
            const initialEventTimestamp = getInitialEventTimestamp(...entry);

            return initialEventTimestamp <= initialEventBefore;
          });
        }

        let aggregateIds = aggregateEntries.map(([aggregateId]) => aggregateId);

        if (reverse === true) {
          aggregateIds = aggregateIds.reverse();
        }

        if (exclusiveStartKey !== undefined) {
          const exclusiveStartKeyIndex = aggregateIds.findIndex(
            aggregateId => aggregateId === exclusiveStartKey,
          );

          aggregateIds = aggregateIds.slice(exclusiveStartKeyIndex + 1);
        }

        const numberOfAggregateIdsBeforeLimit = aggregateIds.length;
        if (limit !== undefined) {
          aggregateIds = aggregateIds.slice(0, limit);
        }

        const hasNextPage =
          limit === undefined ? false : numberOfAggregateIdsBeforeLimit > limit;

        const parsedNextPageToken: ParsedPageToken = {
          limit,
          initialEventAfter,
          initialEventBefore,
          reverse,
          lastEvaluatedKey: aggregateIds[aggregateIds.length - 1],
        };

        resolve({
          aggregateIds,
          ...(hasNextPage
            ? { nextPageToken: JSON.stringify(parsedNextPageToken) }
            : {}),
        });
      });

    // We do not implement snapshots in this adapter
    this.putSnapshot = () => new Promise(resolve => resolve());
    this.getLastSnapshot = () =>
      new Promise(resolve => resolve({ snapshot: undefined }));
    this.listSnapshots = () =>
      new Promise(resolve => resolve({ snapshots: [] }));
  }
}
