import { Aggregate } from '~/aggregate';
import { EventDetail } from '~/event/eventDetail';

export type AnyMessage = EventDetail & {
  eventStoreId: string;
  aggregate?: Aggregate;
};
