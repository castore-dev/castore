import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type {
  EventsQueryOptions,
  ListAggregateIdsOptions,
  ListAggregateIdsOutput,
} from '~/storageAdapter';
import type { $Contravariant } from '~/utils';

export type Reducer<
  A extends Aggregate = Aggregate,
  D extends EventDetail = EventDetail,
  $D extends EventDetail = $Contravariant<D, EventDetail>,
  $A extends Aggregate = $Contravariant<A, Aggregate>,
> = (aggregate: $A, event: $D) => A;

export type SideEffectsSimulator<
  D extends EventDetail,
  $D extends EventDetail = $Contravariant<D, EventDetail>,
> = (
  indexedEvents: Record<string, Omit<$D, 'version'>>,
  event: $D,
) => Record<string, Omit<D, 'version'>>;

export type EventsGetter<D extends EventDetail> = (
  aggregateId: string,
  options?: EventsQueryOptions,
) => Promise<{ events: D[] }>;

export type EventPusher<$D extends EventDetail> = (
  eventDetail: $D,
) => Promise<void>;

export type AggregateIdsLister = (
  listAggregateOptions?: ListAggregateIdsOptions,
) => Promise<ListAggregateIdsOutput>;

export type GetAggregateOptions = {
  maxVersion?: number;
};

export type AggregateGetter<
  D extends EventDetail,
  A extends Aggregate,
  R extends boolean = false,
> = (
  aggregateId: string,
  options?: GetAggregateOptions,
) => Promise<{
  aggregate: R extends true ? A : A | undefined;
  events: D[];
  lastEvent: R extends true ? D : D | undefined;
}>;

export type SimulationOptions = { simulationDate?: string };

export type AggregateSimulator<$D extends EventDetail, A extends Aggregate> = (
  events: $D[],
  options?: SimulationOptions,
) => A | undefined;
