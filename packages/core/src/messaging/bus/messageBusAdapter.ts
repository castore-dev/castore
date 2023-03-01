import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';

export interface MessageBusAdapter {
  publishMessage: (
    event: EventDetail & { aggregate?: Aggregate; eventStoreId: string },
  ) => Promise<void>;
}
