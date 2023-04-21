/* eslint-disable max-lines */
import {
  Aggregate,
  EventDetail,
  GroupedEvent,
  PushEventContext,
  StorageAdapter,
} from '@castore/core';

import { InMemoryEventAlreadyExistsError } from './error';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

type InMemoryGroupedEvent<
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> = GroupedEvent<EVENT_DETAILS, AGGREGATE> & {
  eventStorageAdapter: InMemoryStorageAdapter;
};

const hasInMemoryStorageAdapter = (
  groupedEvent: GroupedEvent,
): groupedEvent is InMemoryGroupedEvent =>
  groupedEvent.eventStorageAdapter instanceof InMemoryStorageAdapter;

const hasContext = (
  groupedEvent: GroupedEvent,
): groupedEvent is GroupedEvent & {
  context: NonNullable<InMemoryGroupedEvent['context']>;
} => groupedEvent.context !== undefined;

const parseGroupedEvents = (
  ...groupedEvents: GroupedEvent[]
): (InMemoryGroupedEvent & {
  context: NonNullable<InMemoryGroupedEvent['context']>;
})[] => {
  const inMemoryGroupedEvents: (InMemoryGroupedEvent & {
    context: NonNullable<InMemoryGroupedEvent['context']>;
  })[] = [];

  groupedEvents.forEach((groupedEvent, groupedEventIndex) => {
    if (!hasInMemoryStorageAdapter(groupedEvent)) {
      throw new Error(
        `Event group event #${groupedEventIndex} is not connected to a InMemoryEventStorageAdapter`,
      );
    }

    if (!hasContext(groupedEvent)) {
      throw new Error(`Event group event #${groupedEventIndex} misses context`);
    }

    inMemoryGroupedEvents.push(groupedEvent);
  });

  return inMemoryGroupedEvents;
};

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
  pushEventSync: (
    eventDetail: EventDetail,
    context: PushEventContext,
  ) => Awaited<ReturnType<StorageAdapter['pushEvent']>>;
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

    this.pushEventSync = (event, context) => {
      const { aggregateId, version } = event;
      const events = this.eventStore[aggregateId];

      if (events === undefined) {
        this.eventStore[aggregateId] = [event];

        return { event };
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

      return { event };
    };

    this.pushEvent = async (event, context) =>
      new Promise(resolve => {
        const timestamp = new Date().toISOString();
        resolve(this.pushEventSync({ timestamp, ...event }, context));
      });

    this.pushEventGroup = async (...groupedEvents) =>
      new Promise(resolve => {
        const inMemoryGroupedEvents = parseGroupedEvents(...groupedEvents);

        const responses: { event: EventDetail }[] = [];

        const timestamp = new Date().toISOString();
        for (const groupedEvent of inMemoryGroupedEvents) {
          const { eventStorageAdapter, event, context } = groupedEvent;

          try {
            const response = eventStorageAdapter.pushEventSync(
              { timestamp, ...event },
              context,
            );
            responses.push(response);
          } catch (error) {
            [...inMemoryGroupedEvents]
              .slice(0, responses.length)
              // Revert it in reversed order
              .reverse()
              .forEach(groupedEventToRevert => {
                const {
                  eventStorageAdapter: eventToRevertStorageAdapter,
                  event: eventToRevert,
                } = groupedEventToRevert;
                const { aggregateId, version } = eventToRevert;

                const revertedEvent =
                  eventToRevertStorageAdapter.eventStore[aggregateId]?.pop();

                // Check that version is indeed last pushed event
                if (revertedEvent?.version !== version) {
                  if (revertedEvent !== undefined) {
                    eventToRevertStorageAdapter.eventStore[aggregateId]?.push(
                      revertedEvent,
                    );
                  }

                  throw new Error(
                    `Unable to revert partially pushed event group. Original error: "${String(
                      error,
                    )}"`,
                  );
                }
              });

            throw error;
          }
        }

        resolve({ eventGroup: responses });
      });

    this.groupEvent = event =>
      new GroupedEvent({ event, eventStorageAdapter: this });

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
