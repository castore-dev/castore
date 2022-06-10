import { Aggregate } from '@castore/event-store';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  REMOVED = 'REMOVED',
}

export type UserAggregate = Aggregate & {
  firstName: string;
  lastName: string;
  status: UserStatus;
};
