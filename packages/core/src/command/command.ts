import {
  EventAlreadyExistsError,
  isEventAlreadyExistsError,
  EventStore,
} from '~/eventStore';
import type { $Contravariant } from '~/typeUtils';

export type OnEventAlreadyExistsCallback = (
  error: EventAlreadyExistsError,
  context: { attemptNumber: number; retriesLeft: number },
) => Promise<void>;

export const tuple = <ARGUMENTS extends unknown[]>(
  ...args: ARGUMENTS
): ARGUMENTS => args;

export class Command<
  COMMAND_ID extends string = string,
  EVENT_STORES extends EventStore[] = EventStore[],
  $EVENT_STORES extends EventStore[] = $Contravariant<
    EVENT_STORES,
    EventStore[]
  >,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  INPUT = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OUTPUT = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CONTEXT extends any[] = any[],
> {
  _types?: {
    input: INPUT;
    output: OUTPUT;
    context: CONTEXT;
  };
  commandId: COMMAND_ID;
  requiredEventStores: EVENT_STORES;
  eventAlreadyExistsRetries: number;
  onEventAlreadyExists: OnEventAlreadyExistsCallback;
  handler: (
    input: INPUT,
    eventStores: $EVENT_STORES,
    ...context: CONTEXT
  ) => Promise<OUTPUT>;

  constructor({
    commandId,
    requiredEventStores,
    eventAlreadyExistsRetries = 2,
    onEventAlreadyExists = async () => new Promise(resolve => resolve()),
    handler,
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

export type CommandId<COMMAND extends Command> = COMMAND['commandId'];

export type CommandInput<COMMAND extends Command> = NonNullable<
  COMMAND['_types']
>['input'];

export type CommandOutput<COMMAND extends Command> = NonNullable<
  COMMAND['_types']
>['output'];

export type CommandContext<COMMAND extends Command> = NonNullable<
  COMMAND['_types']
>['context'];
