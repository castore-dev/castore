import type { EnhancedStore } from '@reduxjs/toolkit';

import { GroupedEvent, StorageAdapter } from '@castore/core';

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

export class ReduxEventStorageAdapter implements StorageAdapter {
  getEvents: StorageAdapter['getEvents'];
  pushEvent: StorageAdapter['pushEvent'];
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

    this.getEventStoreState = () => {
      const eventStoreState = this.store.getState()[this.eventStoreSliceName];

      if (eventStoreState === undefined)
        throw new EventStoreReduxStateNotFoundError({
          eventStoreSliceName: this.eventStoreSliceName,
        });

      return eventStoreState;
    };

    this.pushEvent = async eventWithoutTimestamp =>
      new Promise(resolve => {
        const timestamp = new Date().toISOString();
        const event = { ...eventWithoutTimestamp, timestamp };
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

        resolve({ event });
      });

    this.groupEvent = event =>
      new GroupedEvent({ event, eventStorageAdapter: this });

    this.getEvents = (
      aggregateId,
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

    this.listAggregateIds = ({
      pageToken: inputPageToken,
      ...inputOptions
    } = {}) =>
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
