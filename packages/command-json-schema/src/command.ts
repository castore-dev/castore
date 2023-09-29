import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

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
  COMMAND_ID extends string = string,
  EVENT_STORES extends EventStore[] = EventStore[],
  $EVENT_STORES extends EventStore[] = $Contravariant<
    EVENT_STORES,
    EventStore[]
  >,
  INPUT_SCHEMA extends JSONSchema | undefined = JSONSchema | undefined,
  INPUT = $Contravariant<
    INPUT_SCHEMA,
    JSONSchema,
    INPUT_SCHEMA extends JSONSchema ? FromSchema<INPUT_SCHEMA> : never
  >,
  OUTPUT_SCHEMA extends JSONSchema | undefined = JSONSchema | undefined,
  OUTPUT = $Contravariant<
    OUTPUT_SCHEMA,
    JSONSchema,
    OUTPUT_SCHEMA extends JSONSchema ? FromSchema<OUTPUT_SCHEMA> : never
  >,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CONTEXT extends any[] = any[],
> extends Command<
  COMMAND_ID,
  EVENT_STORES,
  $EVENT_STORES,
  INPUT,
  OUTPUT,
  CONTEXT
> {
  inputSchema?: INPUT_SCHEMA;
  outputSchema?: OUTPUT_SCHEMA;

  constructor({
    commandId,
    requiredEventStores,
    eventAlreadyExistsRetries,
    onEventAlreadyExists,
    handler,
    inputSchema,
    outputSchema,
  }: {
    commandId: COMMAND_ID;
    requiredEventStores: EVENT_STORES;
    eventAlreadyExistsRetries?: number;
    onEventAlreadyExists?: OnEventAlreadyExistsCallback;
    handler: (
      input: INPUT,
      eventStores: $EVENT_STORES,
      ...context: CONTEXT
    ) => Promise<OUTPUT>;
    inputSchema?: INPUT_SCHEMA;
    outputSchema?: OUTPUT_SCHEMA;
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
