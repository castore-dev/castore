/* eslint-disable max-lines */
import type {
  Aggregate,
  EventDetail,
  PushEventOptions,
  EventStorageAdapter,
} from '@castore/core';
import { GroupedEvent } from '@castore/core';

import { InMemoryEventAlreadyExistsError } from './error';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

type InMemoryGroupedEvent<
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> = GroupedEvent<EVENT_DETAILS, AGGREGATE> & {
  eventStorageAdapter: InMemoryEventStorageAdapter;
};

const hasInMemoryEventStorageAdapter = (
  groupedEvent: GroupedEvent,
): groupedEvent is InMemoryGroupedEvent =>
  groupedEvent.eventStorageAdapter instanceof InMemoryEventStorageAdapter;

const hasContext = (
  groupedEvent: GroupedEvent,
): groupedEvent is GroupedEvent & {
  context: NonNullable<GroupedEvent['context']>;
} => groupedEvent.context !== undefined;

const parseGroupedEvents = (
  ...groupedEventsInput: GroupedEvent[]
): {
  groupedEvents: (InMemoryGroupedEvent & {
    context: NonNullable<GroupedEvent['context']>;
  })[];
  timestamp?: string;
} => {
  let timestampInfos:
    | { timestamp: string; groupedEventIndex: number }
    | undefined;
  const groupedEvents: (InMemoryGroupedEvent & {
    context: NonNullable<InMemoryGroupedEvent['context']>;
  })[] = [];

  groupedEventsInput.forEach((groupedEvent, groupedEventIndex) => {
    if (!hasInMemoryEventStorageAdapter(groupedEvent)) {
      throw new Error(
        `Event group event #${groupedEventIndex} is not connected to a InMemoryEventStorageAdapter`,
      );
    }

    if (!hasContext(groupedEvent)) {
      throw new Error(`Event group event #${groupedEventIndex} misses context`);
    }

    if (
      groupedEvent.event.timestamp !== undefined &&
      timestampInfos !== undefined
    ) {
      timestampInfos = {
        timestamp: groupedEvent.event.timestamp,
        groupedEventIndex,
      };
    }

    groupedEvents.push(groupedEvent);
  });

  if (timestampInfos !== undefined) {
    /**
     * @debt type "strangely, a second const is needed to keep the type as defined in forEach loop"
     */
    const _timestampInfos = timestampInfos;
    groupedEvents.forEach((groupedEvent, groupedEventIndex) => {
      if (groupedEvent.event.timestamp === undefined) {
        groupedEvent.event.timestamp = _timestampInfos.timestamp;
      } else if (groupedEvent.event.timestamp !== _timestampInfos.timestamp) {
        throw new Error(
          `Event group events #${groupedEventIndex} and #${_timestampInfos.groupedEventIndex} have different timestamps`,
        );
      }
    });
  }

  return {
    groupedEvents,
    ...(timestampInfos !== undefined
      ? { timestamp: timestampInfos.timestamp }
      : {}),
  };
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

export class InMemoryEventStorageAdapter implements EventStorageAdapter {
  getEvents: EventStorageAdapter['getEvents'];
  pushEventSync: (
    eventDetail: EventDetail,
    options: PushEventOptions,
  ) => Awaited<ReturnType<EventStorageAdapter['pushEvent']>>;
  pushEvent: EventStorageAdapter['pushEvent'];
  pushEventGroup: EventStorageAdapter['pushEventGroup'];
  groupEvent: EventStorageAdapter['groupEvent'];
  listAggregateIds: EventStorageAdapter['listAggregateIds'];
  putSnapshot: EventStorageAdapter['putSnapshot'];
  getLastSnapshot: EventStorageAdapter['getLastSnapshot'];
  listSnapshots: EventStorageAdapter['listSnapshots'];

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

    this.pushEventSync = (event, options) => {
      const { aggregateId, version } = event;
      const { eventStoreId, force = false } = options;

      const events = this.eventStore[aggregateId];

      if (events === undefined) {
        this.eventStore[aggregateId] = [event];

        return { event };
      }

      const existingEventIndex = events.findIndex(
        ({ version: existingVersion }) => existingVersion === version,
      );

      if (existingEventIndex !== -1) {
        if (force) {
          events[existingEventIndex] = event;

          return { event };
        } else {
          throw new InMemoryEventAlreadyExistsError({
            eventStoreId,
            aggregateId,
            version,
          });
        }
      }

      events.push(event);

      return { event };
    };

    this.pushEvent = async (event, options) =>
      new Promise(resolve => {
        const timestamp = new Date().toISOString();
        resolve(this.pushEventSync({ timestamp, ...event }, options));
      });

    this.pushEventGroup = async (...groupedEventsInput) =>
      new Promise(resolve => {
        const { groupedEvents, timestamp = new Date().toISOString() } =
          parseGroupedEvents(...groupedEventsInput);

        const responses: { event: EventDetail }[] = [];

        for (const groupedEvent of groupedEvents) {
          const { eventStorageAdapter, event, context } = groupedEvent;

          try {
            const response = eventStorageAdapter.pushEventSync(
              { timestamp, ...event },
              context,
            );
            responses.push(response);
          } catch (error) {
            [...groupedEvents]
              .slice(0, responses.length)
              // Revert it in reversed order
              .reverse()
              .forEach(groupedEventToRevert => {
                const {
                  eventStorageAdapter: eventToRevertEventStorageAdapter,
                  event: eventToRevert,
                } = groupedEventToRevert;
                const { aggregateId, version } = eventToRevert;

                const revertedEvent =
                  eventToRevertEventStorageAdapter.eventStore[
                    aggregateId
                  ]?.pop();

                // Check that version is indeed last pushed event
                if (revertedEvent?.version !== version) {
                  if (revertedEvent !== undefined) {
                    eventToRevertEventStorageAdapter.eventStore[
                      aggregateId
                    ]?.push(revertedEvent);
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
      _,
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

    this.listAggregateIds = (
      _,
      { pageToken: inputPageToken, ...inputOptions } = {},
    ) =>
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
