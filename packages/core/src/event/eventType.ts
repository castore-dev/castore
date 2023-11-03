import type { EventDetail } from './eventDetail';
import { reservedEventTypes } from './reservedEventTypes';

export class EventType<
  TYPE extends string = string,
  PAYLOAD = string extends TYPE ? unknown : never,
  METADATA = string extends TYPE ? unknown : never,
> {
  _types?: {
    detail: EventDetail<TYPE, PAYLOAD, METADATA>;
  };
  type: TYPE;
  parseEventDetail?: (candidate: unknown) =>
    | {
        isValid: true;
        parsedEventDetail: EventDetail<TYPE, PAYLOAD, METADATA>;
        parsingErrors?: never;
      }
    | {
        isValid: false;
        parsedEventDetail?: never;
        parsingErrors?: [Error, ...Error[]];
      };

  constructor({ type }: { type: TYPE }) {
    if (reservedEventTypes.has(type)) {
      throw new Error(
        `${type} is a reserved event type. Please chose another one.`,
      );
    }

    this.type = type;
  }
}

export type EventTypeDetail<EVENT_TYPE extends EventType> = NonNullable<
  EVENT_TYPE['_types']
>['detail'];

export type EventTypeDetails<EVENT_TYPES extends EventType[]> =
  EVENT_TYPES[number] extends infer EVENT_TYPE
    ? EVENT_TYPE extends EventType
      ? EventTypeDetail<EVENT_TYPE>
      : never
    : never;
