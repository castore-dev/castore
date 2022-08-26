import intersectionBy from 'lodash/intersectionBy';

import {
  EventAlreadyExistsError,
  EventDetail,
  EventsQueryOptions,
  ListAggregateIdsOptions,
  ListAggregateIdsOutput,
  PushEventContext,
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
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: EventDetail[] }>;
  pushEvent: (
    eventDetail: EventDetail,
    context: PushEventContext,
  ) => Promise<void>;
  listAggregateIds: (
    options?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;

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

    // eslint-disable-next-line @typescript-eslint/require-await
    this.pushEvent = async (event, context) => {
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

        return;
      }

      aggregateEvents.push(event);
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    this.getEvents = async aggregateId => ({
      events: this.eventStore[aggregateId] ?? [],
    });

    this.listAggregateIds = async ({
      limit: inputLimit,
      pageToken: inputPageToken,
      // eslint-disable-next-line @typescript-eslint/require-await
    } = {}) => {
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

      return {
        aggregateIds: aggregateIds.slice(
          appliedStartIndex,
          appliedExclusiveEndIndex,
        ),
        ...(hasNextPage
          ? { nextPageToken: JSON.stringify(parsedNextPageToken) }
          : {}),
      };
    };
  }
}
