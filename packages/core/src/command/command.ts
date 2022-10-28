import type { EventStore } from '~/eventStore';
import type { $Contravariant } from '~/utils';

export const tuple = <A extends unknown[]>(...args: A): A => args;

/**
 * @debt feature "Command should be able to take metadata/context as 2nd inputs"
 */
export class Command<
  E extends EventStore[] = EventStore[],
  $E extends EventStore[] = $Contravariant<E, EventStore[]>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  I = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  O = any,
> {
  _types?: {
    input: I;
    output: O;
  };
  commandId: string;
  requiredEventStores: E;
  handler: (input: I, requiredEventStores: $E) => Promise<O>;

  constructor({
    commandId,
    requiredEventStores,
    handler,
  }: {
    commandId: string;
    requiredEventStores: E;
    handler: (input: I, requiredEventStores: $E) => Promise<O>;
  }) {
    this.commandId = commandId;
    this.requiredEventStores = requiredEventStores;
    this.handler = handler;
  }
}
