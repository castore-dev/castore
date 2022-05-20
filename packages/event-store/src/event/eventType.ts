import { EventDetail } from './eventDetail';

export class EventType<
  T extends string = string,
  D extends EventDetail = EventDetail,
> {
  _types?: { detail?: D };
  type: T;

  constructor({ type }: { type: T }) {
    this.type = type;
  }
}

export type EventTypeDetail<
  E extends EventType,
  D extends EventDetail = Exclude<
    Exclude<E['_types'], undefined>['detail'],
    undefined
  >,
> = EventDetail extends D
  ? {
      aggregateId: string;
      version: number;
      type: E['type'];
      timestamp: string;
      payload: Record<never, unknown>;
    }
  : D;
