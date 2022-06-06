import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { EventStore } from 'eventStore';

import { Command } from '../command';

export class JSONSchemaCommand<
  $E extends EventStore[] = EventStore[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends EventStore[] = EventStore[] extends $E ? any : $E,
  IS extends JSONSchema | undefined = JSONSchema | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  I = IS extends JSONSchema ? FromSchema<IS> : any,
  OS extends JSONSchema | undefined = JSONSchema | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  O = OS extends JSONSchema ? FromSchema<OS> : any,
> implements Command<$E, E, I, O>
{
  // @ts-ignore _types only
  _types: {
    input: I;
    output: O;
  };
  requiredEventStores: $E;
  inputSchema?: IS;
  outputSchema?: OS;
  handler: (input: I, requiredEventStores: E) => Promise<O>;

  constructor({
    requiredEventStores,
    inputSchema,
    outputSchema,
    handler,
  }: {
    requiredEventStores: $E;
    inputSchema?: IS;
    outputSchema?: OS;
    handler: (input: I, requiredEventStores: E) => Promise<O>;
  }) {
    this.requiredEventStores = requiredEventStores;
    this.handler = handler;

    if (inputSchema !== undefined) {
      this.inputSchema = inputSchema;
    }

    if (outputSchema !== undefined) {
      this.outputSchema = outputSchema;
    }
  }
}
