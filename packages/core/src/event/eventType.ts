import { EventDetail } from './eventDetail';

export class EventType<
  T extends string = string,
  P = string extends T ? unknown : never,
  M = string extends T ? unknown : never,
> {
  _types?: {
    detail: EventDetail<T, P, M>;
  };
  type: T;

  constructor({ type }: { type: T }) {
    this.type = type;
  }
}

export type EventTypeDetail<E extends EventType> = NonNullable<
  E['_types']
>['detail'];

export type EventTypesDetails<E extends EventType[]> = E[number] extends infer U
  ? U extends EventType
    ? EventTypeDetail<U>
    : never
  : never;
