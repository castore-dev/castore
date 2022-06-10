import { Aggregate } from '@castore/event-store';

export enum CounterStatus {
  ACTIVE = 'ACTIVE',
  REMOVED = 'REMOVED',
}

export type CounterAggregate = Aggregate & {
  userId: string;
  status: CounterStatus;
  count: number;
};
