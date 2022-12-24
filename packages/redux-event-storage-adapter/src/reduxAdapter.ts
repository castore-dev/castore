import type { EnhancedStore } from '@reduxjs/toolkit';

import type { StorageAdapter } from '@castore/core';

import {
  ReduxStoreEventAlreadyExistsError,
  EventStoreReduxStateNotFoundError,
} from '~/errors';

import type { EventStoreReduxState, EventStoresReduxState } from './types';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

export class ReduxEventStorageAdapter implements StorageAdapter {
  getEvents: StorageAdapter['getEvents'];
  pushEvent: StorageAdapter['pushEvent'];
  listAggregateIds: StorageAdapter['listAggregateIds'];
  putSnapshot: StorageAdapter['putSnapshot'];
  getLastSnapshot: StorageAdapter['getLastSnapshot'];
  listSnapshots: StorageAdapter['listSnapshots'];

  store: EnhancedStore<EventStoresReduxState>;
  // TODO: see if it's possible to get eventStoreId from operations context and provide one adapter for all event stores in configureCastore
  eventStoreId: string;
  getEventStoreState: () => EventStoreReduxState;

  constructor({
    store,
    eventStoreId,
  }: {
    store: EnhancedStore<EventStoresReduxState>;
    eventStoreId: string;
  }) {
    this.store = store;
    this.eventStoreId = eventStoreId;

    this.getEventStoreState = () => {
      const eventStoreState = this.store.getState()[this.eventStoreId];

      if (eventStoreState === undefined)
        throw new EventStoreReduxStateNotFoundError({
          eventStoreId: this.eventStoreId,
        });

      return eventStoreState;
    };

    this.pushEvent = async event =>
      new Promise(resolve => {
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
          type: `${this.eventStoreId}/eventPushed`,
          payload: event,
        });

        resolve();
      });

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
      limit: inputLimit,
      pageToken: inputPageToken,
    } = {}) =>
      new Promise(resolve => {
        const eventStoreState = this.getEventStoreState();

        const aggregateIds = [...eventStoreState.aggregateIds]
          .sort(
            (
              { initialEventTimestamp: initialEventTimestampA },
              { initialEventTimestamp: initialEventTimestampB },
            ) => (initialEventTimestampA > initialEventTimestampB ? 1 : -1),
          )
          .map(({ aggregateId }) => aggregateId);

        const { appliedLimit, appliedStartIndex = 0 } =
          parseAppliedListAggregateIdsOptions({ inputLimit, inputPageToken });

        const appliedExclusiveEndIndex =
          appliedLimit === undefined
            ? undefined
            : appliedStartIndex + appliedLimit;

        const hasNextPage =
          appliedExclusiveEndIndex === undefined
            ? false
            : aggregateIds[appliedExclusiveEndIndex] !== undefined;

        const parsedNextPageToken: ParsedPageToken = {
          limit: appliedLimit,
          exclusiveEndIndex: appliedExclusiveEndIndex,
        };

        resolve({
          aggregateIds: aggregateIds.slice(
            appliedStartIndex,
            appliedExclusiveEndIndex,
          ),
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
