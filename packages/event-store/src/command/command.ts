import { EventStore } from 'eventStore';

export const tuple = <A extends unknown[]>(...args: A): A => args;

/**
 * @debt feature "Command should be able to take metadata/context as 2nd inputs"
 */
export class Command<
  $E extends EventStore[] = EventStore[],
  // cf https://devblogs.microsoft.com/typescript/announcing-typescript-4-7-rc/#optional-variance-annotations-for-type-parameters
  // Command is contravariant on its fns args: We have to type them as any
  // So that Command implementations still extends the Command type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends EventStore[] = EventStore[] extends $E ? any : $E,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  I = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  O = any,
> {
  // @ts-ignore _types only
  _types: {
    input: I;
    output: O;
  };
  commandId: string;
  requiredEventStores: $E;
  handler: (input: I, requiredEventStores: E) => Promise<O>;

  constructor({
    commandId,
    requiredEventStores,
    handler,
  }: {
    commandId: string;
    requiredEventStores: $E;
    handler: (input: I, requiredEventStores: E) => Promise<O>;
  }) {
    this.commandId = commandId;
    this.requiredEventStores = requiredEventStores;
    this.handler = handler;
  }
}
