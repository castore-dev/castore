import type { EventDetail, OptionalTimestamp } from '~/event/eventDetail';
import type { GroupedEvent } from '~/event/groupedEvent';

export type EventsQueryOptions = {
  minVersion?: number;
  maxVersion?: number;
  limit?: number;
  reverse?: boolean;
};

export type EventStoreContext = { eventStoreId: string };

export type PushEventOptions = EventStoreContext & {
  force?: boolean;
};

export type ListAggregateIdsOptions = {
  limit?: number;
  pageToken?: string;
  initialEventAfter?: string;
  initialEventBefore?: string;
  reverse?: boolean;
};

export type ListAggregateIdsOutput = {
  aggregateIds: {
    aggregateId: string;
    initialEventTimestamp: string;
  }[];
  nextPageToken?: string;
};

export interface EventStorageAdapter {
  getEvents: (
    aggregateId: string,
    context: EventStoreContext,
    options?: EventsQueryOptions,
  ) => Promise<{ events: EventDetail[] }>;
  pushEvent: (
    eventDetail: OptionalTimestamp<EventDetail>,
    options: PushEventOptions,
  ) => Promise<{ event: EventDetail }>;
  pushEventGroup: (
    options: { force?: boolean },
    ...groupedEvents: [GroupedEvent, ...GroupedEvent[]]
  ) => Promise<{ eventGroup: { event: EventDetail }[] }>;
  groupEvent: (eventDetail: OptionalTimestamp<EventDetail>) => GroupedEvent;
  listAggregateIds: (
    context: EventStoreContext,
    options?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;
  eventTableEventStoreIdKey?: string;
  eventTableInitialEventIndexName?: string;
  eventTablePk?: string;
  eventTableSk?: string;
  eventTableTimestampKey?: string;
}
