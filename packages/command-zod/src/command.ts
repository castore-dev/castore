import { z, ZodType } from 'zod';

import {
  Command,
  EventStore,
  $Contravariant,
  OnEventAlreadyExistsCallback,
} from '@castore/core';

export { OnEventAlreadyExistsCallback };

export class ZodCommand<
  COMMAND_ID extends string = string,
  EVENT_STORES extends EventStore[] = EventStore[],
  $EVENT_STORES extends EventStore[] = $Contravariant<
    EVENT_STORES,
    EventStore[]
  >,
  INPUT_SCHEMA extends ZodType | undefined = ZodType | undefined,
  INPUT = $Contravariant<
    INPUT_SCHEMA,
    ZodType,
    INPUT_SCHEMA extends ZodType ? z.infer<INPUT_SCHEMA> : never
  >,
  OUTPUT_SCHEMA extends ZodType | undefined = ZodType | undefined,
  OUTPUT = $Contravariant<
    OUTPUT_SCHEMA,
    ZodType,
    OUTPUT_SCHEMA extends ZodType ? z.infer<OUTPUT_SCHEMA> : never
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
