import { EventDetail } from './eventDetail';

export class EventType<
  TYPE extends string = string,
  PAYLOAD = string extends TYPE ? unknown : never,
  METADATA = string extends TYPE ? unknown : never,
> {
  _types?: {
    detail: EventDetail<TYPE, PAYLOAD, METADATA>;
  };
  type: TYPE;

  constructor({ type }: { type: TYPE }) {
    this.type = type;
  }
}

export type EventTypeDetail<EVENT_TYPE extends EventType> = NonNullable<
  EVENT_TYPE['_types']
>['detail'];

/**
 * @debt v2 "rename as EventTypeDetails"
 */
export type EventTypesDetails<EVENT_TYPES extends EventType[]> =
  EVENT_TYPES[number] extends infer EVENT_TYPE
    ? EVENT_TYPE extends EventType
      ? EventTypeDetail<EVENT_TYPE>
      : never
    : never;
