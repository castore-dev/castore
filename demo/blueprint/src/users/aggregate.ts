import type { Aggregate } from '@castore/core';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  REMOVED = 'REMOVED',
}

export type UserAggregate = Aggregate & {
  firstName: string;
  lastName: string;
  status: UserStatus;
};
