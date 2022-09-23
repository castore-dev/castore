import cloneDeep from 'lodash/cloneDeep';
import intersectionBy from 'lodash/intersectionBy';

import {
  EventAlreadyExistsError,
  EventDetail,
  StorageAdapter,
} from '@castore/core';

import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

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

    this.pushEvent = async (event, context) =>
      new Promise(resolve => {
        const { aggregateId, version } = event;
        const events = this.eventStore[aggregateId];

        if (intersectionBy(events, [event], 'version').length > 0) {
          const { eventStoreId } = context;

          throw new EventAlreadyExistsError({
            eventStoreId,
            aggregateId,
            version,
          });
        }

        const aggregateEvents = this.eventStore[aggregateId];

        if (aggregateEvents === undefined) {
          this.eventStore[aggregateId] = [event];
          resolve();

          return;
        }

        aggregateEvents.push(event);
        resolve();
      });

    this.getEvents = (
      aggregateId,
      { minVersion, maxVersion, reverse, limit } = {},
    ) =>
      new Promise(resolve => {
        let events = cloneDeep(this.eventStore[aggregateId] ?? []);

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
        const aggregateIds = Object.entries(this.eventStore)
          .sort((entryA, entryB) => {
            const initialEventATimestamp = getInitialEventTimestamp(...entryA);
            const initialEventBTimestamp = getInitialEventTimestamp(...entryB);

            return initialEventATimestamp > initialEventBTimestamp ? 1 : -1;
          })
          .map(([aggregateId]) => aggregateId);

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
