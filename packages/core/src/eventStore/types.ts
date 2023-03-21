import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type {
  EventsQueryOptions,
  ListAggregateIdsOptions,
  ListAggregateIdsOutput,
} from '~/storageAdapter';
import type { $Contravariant } from '~/utils';

export type Reducer<
  AGGREGATE extends Aggregate = Aggregate,
  EVENT_DETAIL extends EventDetail = EventDetail,
  $EVENT_DETAIL extends EventDetail = $Contravariant<EVENT_DETAIL, EventDetail>,
  $AGGREGATE extends Aggregate = $Contravariant<AGGREGATE, Aggregate>,
> = (aggregate: $AGGREGATE, event: $EVENT_DETAIL) => AGGREGATE;

export type SideEffectsSimulator<
  EVENT_DETAIL extends EventDetail,
  $EVENT_DETAIL extends EventDetail = $Contravariant<EVENT_DETAIL, EventDetail>,
> = (
  indexedEvents: Record<string, Omit<$EVENT_DETAIL, 'version'>>,
  event: $EVENT_DETAIL,
) => Record<string, Omit<EVENT_DETAIL, 'version'>>;

export type EventsGetter<EVENT_DETAIL extends EventDetail> = (
  aggregateId: string,
  options?: EventsQueryOptions,
) => Promise<{ events: EVENT_DETAIL[] }>;

export type EventPusher<
  EVENT_DETAILS extends EventDetail,
  $EVENT_DETAILS extends EventDetail,
  AGGREGATE extends Aggregate,
  $AGGREGATE extends Aggregate,
> = (
  event: $EVENT_DETAILS extends infer $EVENT_DETAIL
    ? Omit<$EVENT_DETAIL, 'timestamp'>
    : never,
  options?: { prevAggregate?: $AGGREGATE },
) => Promise<{ event: EVENT_DETAILS; nextAggregate?: AGGREGATE }>;

export type AggregateIdsLister = (
  listAggregateOptions?: ListAggregateIdsOptions,
) => Promise<ListAggregateIdsOutput>;

export type GetAggregateOptions = {
  maxVersion?: number;
};

export type AggregateGetter<
  EVENT_DETAIL extends EventDetail,
  AGGREGATE extends Aggregate,
  SHOULD_EXIST extends boolean = false,
> = (
  aggregateId: string,
  options?: GetAggregateOptions,
) => Promise<{
  aggregate: SHOULD_EXIST extends true ? AGGREGATE : AGGREGATE | undefined;
  events: EVENT_DETAIL[];
  lastEvent: SHOULD_EXIST extends true
    ? EVENT_DETAIL
    : EVENT_DETAIL | undefined;
}>;

export type SimulationOptions = { simulationDate?: string };

export type AggregateSimulator<
  $EVENT_DETAIL extends EventDetail,
  AGGREGATE extends Aggregate,
> = (
  events: $EVENT_DETAIL[],
  options?: SimulationOptions,
) => AGGREGATE | undefined;
