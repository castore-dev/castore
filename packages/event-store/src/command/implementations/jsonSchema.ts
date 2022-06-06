import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { EventAlreadyExistsError } from '../../errors/eventAlreadyExists';
import { EventStore } from '../../eventStore';
import { Command } from '../command';

export type OnEventAlreadyExistsCallback = (
  error: EventAlreadyExistsError,
  context: { attemptNumber: number; retriesLeft: number },
) => Promise<void>;

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
  eventAlreadyExistsRetries: number;
  onEventAlreadyExists?: OnEventAlreadyExistsCallback;
  handler: (input: I, requiredEventStores: E) => Promise<O>;

  constructor({
    requiredEventStores,
    inputSchema,
    outputSchema,
    eventAlreadyExistsRetries = 2,
    onEventAlreadyExists,
    handler,
  }: {
    requiredEventStores: $E;
    inputSchema?: IS;
    outputSchema?: OS;
    eventAlreadyExistsRetries?: number;
    onEventAlreadyExists?: OnEventAlreadyExistsCallback;
    handler: (input: I, requiredEventStores: E) => Promise<O>;
  }) {
    this.requiredEventStores = requiredEventStores;
    this.eventAlreadyExistsRetries = eventAlreadyExistsRetries;

    if (onEventAlreadyExists !== undefined) {
      this.onEventAlreadyExists = onEventAlreadyExists;
    }

    if (inputSchema !== undefined) {
      this.inputSchema = inputSchema;
    }

    if (outputSchema !== undefined) {
      this.outputSchema = outputSchema;
    }

    this.handler = async (input, eventStores) => {
      let retriesLeft = this.eventAlreadyExistsRetries;
      let attemptNumber = 1;

      while (retriesLeft >= 0) {
        try {
          const output = await handler(input, eventStores);

          return output;
        } catch (error) {
          if (!(error instanceof EventAlreadyExistsError)) {
            throw error;
          }

          if (this.onEventAlreadyExists) {
            await this.onEventAlreadyExists(error, {
              attemptNumber,
              retriesLeft,
            });
          }

          if (retriesLeft === 0) {
            throw error;
          }

          retriesLeft -= 1;
          attemptNumber += 1;
        }
      }

      /**
       * @debt interface "find a better thing to do in this case (which should not happen anyway)"
       */
      throw new Error('Handler failed to execute');
    };
  }
}
