import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type { GroupedEvent } from '~/event/groupedEvent';

export type EventsQueryOptions = {
  minVersion?: number;
  maxVersion?: number;
  limit?: number;
  reverse?: boolean;
};

export type PushEventContext = { eventStoreId?: string };

export type ListAggregateIdsOptions = {
  limit?: number;
  pageToken?: string;
  initialEventAfter?: string;
  initialEventBefore?: string;
  reverse?: boolean;
};

export type ListAggregateIdsOutput = {
  aggregateIds: string[];
  nextPageToken?: string;
};

export type GetLastSnapshotOptions = {
  maxVersion?: number;
};

export type ListSnapshotsOptions = {
  minVersion?: number;
  maxVersion?: number;
  limit?: number;
  reverse?: boolean;
};

/**
 * @debt v2 "To rename EventStorageAdapter"
 */
export interface StorageAdapter {
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: EventDetail[] }>;
  pushEvent: (
    eventDetail: Omit<EventDetail, 'timestamp'>,
    context: PushEventContext,
  ) => Promise<{ event: EventDetail }>;
  pushEventGroup: (
    ...groupedEvents: [GroupedEvent, ...GroupedEvent[]]
  ) => Promise<{ events: EventDetail[] }>;
  groupEvent: (eventDetail: Omit<EventDetail, 'timestamp'>) => GroupedEvent;
  listAggregateIds: (
    options?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;
  putSnapshot: (aggregate: Aggregate) => Promise<void>;
  getLastSnapshot: (
    aggregateId: string,
    options?: GetLastSnapshotOptions,
  ) => Promise<{ snapshot: Aggregate | undefined }>;
  listSnapshots: (
    aggregateId: string,
    options?: ListSnapshotsOptions,
  ) => Promise<{ snapshots: Aggregate[] }>;
}
