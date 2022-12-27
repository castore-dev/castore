import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import {
  Command,
  EventAlreadyExistsError,
  EventStore,
  $Contravariant,
} from '@castore/core';

export type OnEventAlreadyExistsCallback = (
  error: EventAlreadyExistsError,
  context: { attemptNumber: number; retriesLeft: number },
) => Promise<void>;

export class JSONSchemaCommand<
  C extends string = string,
  E extends EventStore[] = EventStore[],
  $E extends EventStore[] = $Contravariant<E, EventStore[]>,
  IS extends JSONSchema | undefined = JSONSchema | undefined,
  I = $Contravariant<
    IS,
    JSONSchema,
    IS extends JSONSchema ? FromSchema<IS> : never
  >,
  OS extends JSONSchema | undefined = JSONSchema | undefined,
  O = $Contravariant<
    OS,
    JSONSchema,
    OS extends JSONSchema ? FromSchema<OS> : never
  >,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends any[] = any[],
> extends Command<C, E, $E, I, O, T> {
  inputSchema?: IS;
  outputSchema?: OS;

  constructor({
    commandId,
    requiredEventStores,
    eventAlreadyExistsRetries,
    onEventAlreadyExists,
    handler,
    inputSchema,
    outputSchema,
  }: {
    commandId: C;
    requiredEventStores: E;
    eventAlreadyExistsRetries?: number;
    onEventAlreadyExists?: OnEventAlreadyExistsCallback;
    handler: (input: I, eventStores: $E, ...context: T) => Promise<O>;
    inputSchema?: IS;
    outputSchema?: OS;
  }) {
    super({
      commandId,
      requiredEventStores,
      eventAlreadyExistsRetries,
      onEventAlreadyExists,
      handler,
    });

    if (inputSchema !== undefined) {
      this.inputSchema = inputSchema;
    }

    if (outputSchema !== undefined) {
      this.outputSchema = outputSchema;
    }
  }
}
