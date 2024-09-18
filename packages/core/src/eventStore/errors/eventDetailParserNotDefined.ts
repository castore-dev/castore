export class EventDetailParserNotDefinedError extends Error {
  constructor(type: string) {
    super(
      `Can not validate input because EventType "${type}" has no parseEventDetail method defined.`,
    );
  }
}
