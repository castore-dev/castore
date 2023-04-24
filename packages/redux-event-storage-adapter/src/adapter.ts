/* eslint-disable max-lines */
import type { EnhancedStore } from '@reduxjs/toolkit';

import {
  GroupedEvent,
  StorageAdapter,
  EventDetail,
  EventStoreContext,
  Aggregate,
} from '@castore/core';

import {
  ReduxStoreEventAlreadyExistsError,
  EventStoreReduxStateNotFoundError,
} from '~/errors';

import type { EventStoreReduxState, EventStoresReduxState } from './types';
import { getEventStoreSliceName } from './utils/getEventStoreSliceName';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

type ReduxGroupedEvent<
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> = GroupedEvent<EVENT_DETAILS, AGGREGATE> & {
  eventStorageAdapter: ReduxEventStorageAdapter;
};

const hasReduxStorageAdapter = (
  groupedEvent: GroupedEvent,
): groupedEvent is ReduxGroupedEvent =>
  groupedEvent.eventStorageAdapter instanceof ReduxEventStorageAdapter;

const hasContext = (
  groupedEvent: GroupedEvent,
): groupedEvent is GroupedEvent & {
  context: NonNullable<GroupedEvent['context']>;
} => groupedEvent.context !== undefined;

const parseGroupedEvents = (
  ...groupedEvents: GroupedEvent[]
): (ReduxGroupedEvent & {
  context: NonNullable<GroupedEvent['context']>;
})[] => {
  let timestamp: string | undefined;
  const reduxGroupedEvents: (ReduxGroupedEvent & {
    context: NonNullable<GroupedEvent['context']>;
  })[] = [];

  groupedEvents.forEach((groupedEvent, groupedEventIndex) => {
    if (!hasReduxStorageAdapter(groupedEvent)) {
      throw new Error(
        `Event group event #${groupedEventIndex} is not connected to a ReduxEventStorageAdapter`,
      );
    }

    if (!hasContext(groupedEvent)) {
      throw new Error(`Event group event #${groupedEventIndex} misses context`);
    }

    if (groupedEvent.event.timestamp !== undefined) {
      if (timestamp === undefined) {
        timestamp = groupedEvent.event.timestamp;
      } else if (timestamp !== groupedEvent.event.timestamp) {
        throw new Error(
          `Event group event #${groupedEventIndex} has a different timestamp than the previous events`,
        );
      }
    } else {
      if (timestamp !== undefined) {
        groupedEvent.event.timestamp = timestamp;
      }
    }

    reduxGroupedEvents.push(groupedEvent);
  });

  return reduxGroupedEvents;
};

export class ReduxEventStorageAdapter implements StorageAdapter {
  getEvents: StorageAdapter['getEvents'];
  pushEventSync: (
    eventDetail: EventDetail,
    context: EventStoreContext,
  ) => Awaited<ReturnType<StorageAdapter['pushEvent']>>;
  pushEvent: StorageAdapter['pushEvent'];
  pushEventGroup: StorageAdapter['pushEventGroup'];
  groupEvent: StorageAdapter['groupEvent'];
  listAggregateIds: StorageAdapter['listAggregateIds'];
  putSnapshot: StorageAdapter['putSnapshot'];
  getLastSnapshot: StorageAdapter['getLastSnapshot'];
  listSnapshots: StorageAdapter['listSnapshots'];

  store: EnhancedStore<EventStoresReduxState>;
  eventStoreId: string;
  eventStoreSliceName: string;
  getEventStoreState: () => EventStoreReduxState;

  constructor({
    store,
    eventStoreId,
    prefix,
  }: {
    store: EnhancedStore<EventStoresReduxState>;
    eventStoreId: string;
    prefix?: string;
  }) {
    this.store = store;
    this.eventStoreId = eventStoreId;
    this.eventStoreSliceName = getEventStoreSliceName({ eventStoreId, prefix });

    this.getEventStoreState = (
      eventStoreSliceName: string = this.eventStoreSliceName,
    ) => {
      const eventStoreState = this.store.getState()[eventStoreSliceName];

      if (eventStoreState === undefined)
        throw new EventStoreReduxStateNotFoundError({ eventStoreSliceName });

      return eventStoreState;
    };

    this.pushEventSync = event => {
      const { aggregateId } = event;

      const eventStoreState = this.getEventStoreState();

      const events = eventStoreState.eventsByAggregateId[aggregateId] ?? [];

      if (events.some(({ version }) => version === event.version)) {
        throw new ReduxStoreEventAlreadyExistsError({
          eventStoreId: this.eventStoreId,
          aggregateId: event.aggregateId,
          version: event.version,
        });
      }

      this.store.dispatch({
        type: `${this.eventStoreSliceName}/eventPushed`,
        payload: event,
      });

      return { event };
    };

    this.pushEvent = async (event, context) =>
      new Promise(resolve => {
        const timestamp = new Date().toISOString();
        resolve(this.pushEventSync({ timestamp, ...event }, context));
      });

    this.pushEventGroup = async (...groupedEvents) =>
      new Promise(resolve => {
        const reduxGroupedEvents = parseGroupedEvents(...groupedEvents);

        const responses: { event: EventDetail }[] = [];

        const timestamp = new Date().toISOString();
        for (const groupedEvent of reduxGroupedEvents) {
          const { eventStorageAdapter, event, context } = groupedEvent;

          try {
            const response = eventStorageAdapter.pushEventSync(
              { timestamp, ...event },
              context,
            );
            responses.push(response);
          } catch (error) {
            [...reduxGroupedEvents]
              .slice(0, responses.length)
              // Revert it in reversed order
              .reverse()
              .forEach(groupedEventToRevert => {
                const {
                  eventStorageAdapter: eventToRevertStorageAdapter,
                  event: eventToRevert,
                } = groupedEventToRevert;
                const { aggregateId, version } = eventToRevert;

                eventToRevertStorageAdapter.store.dispatch({
                  type: `${eventToRevertStorageAdapter.eventStoreSliceName}/eventReverted`,
                  payload: { aggregateId, version },
                });
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
        const eventStoreState = this.getEventStoreState();

        let events = eventStoreState.eventsByAggregateId[aggregateId] ?? [];

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
        const eventStoreState = this.getEventStoreState();

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

        let aggregateEntries = [...eventStoreState.aggregateIds].sort(
          (
            { initialEventTimestamp: initialEventTimestampA },
            { initialEventTimestamp: initialEventTimestampB },
          ) => (initialEventTimestampA > initialEventTimestampB ? 1 : -1),
        );

        if (initialEventAfter !== undefined) {
          aggregateEntries = aggregateEntries.filter(
            ({ initialEventTimestamp }) =>
              initialEventAfter <= initialEventTimestamp,
          );
        }

        if (initialEventBefore !== undefined) {
          aggregateEntries = aggregateEntries.filter(
            ({ initialEventTimestamp }) =>
              initialEventTimestamp <= initialEventBefore,
          );
        }

        let aggregateIds = aggregateEntries.map(
          ({ aggregateId }) => aggregateId,
        );

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
