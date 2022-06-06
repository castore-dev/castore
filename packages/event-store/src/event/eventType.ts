import { EventDetail } from './eventDetail';

export class EventType<
  T extends string = string,
  D extends EventDetail = EventDetail,
> {
  // @ts-ignore _types only
  _types: {
    detail: D;
  };
  type: T;

  constructor({ type }: { type: T }) {
    this.type = type;
  }
}

export type EventTypeDetail<E extends EventType> = E['_types']['detail'];

export type EventTypesDetails<E extends EventType[]> = E[number] extends infer U
  ? U extends EventType
    ? EventTypeDetail<U>
    : never
  : never;
