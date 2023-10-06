/* eslint-disable max-lines */
import type { EnhancedStore } from '@reduxjs/toolkit';

import {
  GroupedEvent,
  EventStorageAdapter,
  EventDetail,
  PushEventOptions,
  Aggregate,
} from '@castore/core';

import {
  ReduxStoreEventAlreadyExistsError,
  ReduxStateNotFoundError,
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

const hasReduxEventStorageAdapter = (
  groupedEvent: GroupedEvent,
): groupedEvent is ReduxGroupedEvent =>
  groupedEvent.eventStorageAdapter instanceof ReduxEventStorageAdapter;

const hasContext = (
  groupedEvent: GroupedEvent,
): groupedEvent is GroupedEvent & {
  context: NonNullable<GroupedEvent['context']>;
} => groupedEvent.context !== undefined;

const parseGroupedEvents = (
  ...groupedEventsInput: GroupedEvent[]
): {
  groupedEvents: (ReduxGroupedEvent & {
    context: NonNullable<GroupedEvent['context']>;
  })[];
  timestamp?: string;
} => {
  let timestampInfos:
    | { timestamp: string; groupedEventIndex: number }
    | undefined;
  const groupedEvents: (ReduxGroupedEvent & {
    context: NonNullable<GroupedEvent['context']>;
  })[] = [];

  groupedEventsInput.forEach((groupedEvent, groupedEventIndex) => {
    if (!hasReduxEventStorageAdapter(groupedEvent)) {
      throw new Error(
        `Event group event #${groupedEventIndex} is not connected to a ReduxEventStorageAdapter`,
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

export class ReduxEventStorageAdapter implements EventStorageAdapter {
  getEvents: EventStorageAdapter['getEvents'];
  pushEventSync: (
    eventDetail: EventDetail,
    options: PushEventOptions,
  ) => Awaited<ReturnType<EventStorageAdapter['pushEvent']>>;
  pushEvent: EventStorageAdapter['pushEvent'];
  pushEventGroup: EventStorageAdapter['pushEventGroup'];
  groupEvent: EventStorageAdapter['groupEvent'];
  listAggregateIds: EventStorageAdapter['listAggregateIds'];

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
        throw new ReduxStateNotFoundError({ eventStoreSliceName });

      return eventStoreState;
    };

    this.pushEventSync = (event, options) => {
      const { aggregateId } = event;
      const force = options.force ?? false;

      const eventStoreState = this.getEventStoreState();

      const events = eventStoreState.eventsByAggregateId[aggregateId] ?? [];

      if (!force && events.some(({ version }) => version === event.version)) {
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

                eventToRevertEventStorageAdapter.store.dispatch({
                  type: `${eventToRevertEventStorageAdapter.eventStoreSliceName}/eventReverted`,
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
  }
}
