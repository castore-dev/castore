import { EventAlreadyExistsError, isEventAlreadyExistsError } from '~/errors';
import type { EventStore } from '~/eventStore';
import type { $Contravariant } from '~/utils';

export type OnEventAlreadyExistsCallback = (
  error: EventAlreadyExistsError,
  context: { attemptNumber: number; retriesLeft: number },
) => Promise<void>;

export const tuple = <A extends unknown[]>(...args: A): A => args;

export class Command<
  C extends string = string,
  E extends EventStore[] = EventStore[],
  $E extends EventStore[] = $Contravariant<E, EventStore[]>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  I = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  O = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends any[] = any[],
> {
  _types?: {
    input: I;
    output: O;
    context: T;
  };
  commandId: C;
  requiredEventStores: E;
  eventAlreadyExistsRetries: number;
  onEventAlreadyExists: OnEventAlreadyExistsCallback;
  handler: (input: I, eventStores: $E, ...context: T) => Promise<O>;

  constructor({
    commandId,
    requiredEventStores,
    eventAlreadyExistsRetries = 2,
    onEventAlreadyExists = async () => new Promise(resolve => resolve()),
    handler,
  }: {
    commandId: C;
    requiredEventStores: E;
    eventAlreadyExistsRetries?: number;
    onEventAlreadyExists?: OnEventAlreadyExistsCallback;
    handler: (input: I, eventStores: $E, ...context: T) => Promise<O>;
  }) {
    this.commandId = commandId;
    this.requiredEventStores = requiredEventStores;
    this.eventAlreadyExistsRetries = eventAlreadyExistsRetries;
    this.onEventAlreadyExists = onEventAlreadyExists;

    this.handler = async (input, eventStores, ...context) => {
      let retriesLeft = this.eventAlreadyExistsRetries;
      let attemptNumber = 1;

      while (retriesLeft >= 0) {
        try {
          const output = await handler(input, eventStores, ...context);

          return output;
        } catch (error) {
          if (!isEventAlreadyExistsError(error)) {
            throw error;
          }

          await this.onEventAlreadyExists(error, {
            attemptNumber,
            retriesLeft,
          });

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

export type CommandId<C extends Command> = C['commandId'];

export type CommandInput<C extends Command> = NonNullable<C['_types']>['input'];

export type CommandOutput<C extends Command> = NonNullable<
  C['_types']
>['output'];

export type CommandContext<C extends Command> = NonNullable<
  C['_types']
>['context'];
