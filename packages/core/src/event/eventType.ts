import type { EventDetail } from './eventDetail';
import { reservedEventTypes } from './reservedEventTypes';

export type ParsedEventDetail<TYPE extends string, PAYLOAD, METADATA> =
  | {
      isValid: true;
      parsedEventDetail: EventDetail<TYPE, PAYLOAD, METADATA>;
      parsingErrors?: never;
    }
  | {
      isValid: false;
      parsedEventDetail?: never;
      parsingErrors: [Error, ...Error[]];
    };

export type EventDetailParser<
  TYPE extends string = string,
  PAYLOAD = unknown,
  METADATA = unknown,
> = (candidate: EventDetail) => ParsedEventDetail<TYPE, PAYLOAD, METADATA>;

export class EventType<
  TYPE extends string = string,
  PAYLOAD = string extends TYPE ? unknown : never,
  METADATA = string extends TYPE ? unknown : never,
> {
  _types?: {
    detail: EventDetail<TYPE, PAYLOAD, METADATA>;
  };
  type: TYPE;
  parseEventDetail?: EventDetailParser<TYPE, PAYLOAD>;

  constructor({
    type,
    parseEventDetail,
  }: {
    type: TYPE;
    parseEventDetail?: EventDetailParser<TYPE, PAYLOAD>;
  }) {
    if (reservedEventTypes.has(type)) {
      throw new Error(
        `${type} is a reserved event type. Please chose another one.`,
      );
    }
    this.type = type;
    this.parseEventDetail = parseEventDetail;
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
