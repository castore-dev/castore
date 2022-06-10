import { EventStore } from '@castore/event-store';

import { UserAggregate, UserStatus } from './aggregate';
import { userCreatedEvent, userRemovedEvent } from './events';

export const userEventStore = new EventStore({
  eventStoreId: 'USER',
  eventStoreEvents: [userCreatedEvent, userRemovedEvent],
  reduce: (counterAggregate: UserAggregate, event): UserAggregate => {
    const { version, aggregateId } = event;

    switch (event.type) {
      case 'USER_CREATED': {
        const { firstName, lastName } = event.payload;

        return {
          aggregateId,
          version: event.version,
          firstName,
          lastName,
          status: UserStatus.ACTIVE,
        };
      }
      case 'USER_REMOVED':
        return {
          ...counterAggregate,
          version,
          status: UserStatus.REMOVED,
        };
    }
  },
});
