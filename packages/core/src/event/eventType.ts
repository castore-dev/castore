import type { EventDetail } from './eventDetail';
import { reservedEventTypes } from './reservedEventTypes';

export type ParsedCandidate<T> =
  | {
      isValid: false;
      parsedCandidate?: never;
      parsingErrors: [Error, ...Error[]];
    }
  | {
      isValid: true;
      parsedCandidate: T;
      parsingErrors?: never;
    };

export type CandidateParser<T> = (candidate: EventDetail) => ParsedCandidate<T>;

export type EventDetailParser<
  TYPE extends string = string,
  PAYLOAD = unknown,
  METADATA = unknown,
> = CandidateParser<EventDetail<TYPE, PAYLOAD, METADATA>>;

export class EventType<
  TYPE extends string = string,
  PAYLOAD = string extends TYPE ? unknown : never,
  METADATA = string extends TYPE ? unknown : never,
> {
  _types?: {
    detail: EventDetail<TYPE, PAYLOAD, METADATA>;
  };
  type: TYPE;
  parseEventDetail?: EventDetailParser<TYPE, PAYLOAD, METADATA> | undefined;

  constructor({
    type,
    parseEventDetail,
  }: {
    type: TYPE;
    parseEventDetail?: EventDetailParser<TYPE, PAYLOAD, METADATA> | undefined;
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
