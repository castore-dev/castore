import type { A } from 'ts-toolbelt';

import type {
  Command,
  CommandId,
  CommandInput,
  CommandOutput,
  CommandContext,
} from './command';
import {
  counterEventStore,
  incrementCounter,
  Input,
  Output,
  Context,
} from './command.fixtures.test';

// --- CLASS ---

const assertIncrementCounterExtendsCommand: A.Extends<
  typeof incrementCounter,
  Command
> = 1;
assertIncrementCounterExtendsCommand;

// --- HANDLER ---

const assertIncrementCounterHandler: A.Equals<
  typeof incrementCounter.handler,
  (
    input: Input,
    requiredEventStores: [typeof counterEventStore],
    context: Context,
  ) => Promise<Output>
> = 1;
assertIncrementCounterHandler;

// --- HELPERS ---

const assertId: A.Equals<
  CommandId<typeof incrementCounter>,
  'INCREMENT_COUNTER'
> = 1;
assertId;

const assertInput: A.Equals<CommandInput<typeof incrementCounter>, Input> = 1;
assertInput;

const assertOutput: A.Equals<
  CommandOutput<typeof incrementCounter>,
  Output
> = 1;
assertOutput;

const assertContext: A.Equals<
  CommandContext<typeof incrementCounter>,
  [Context]
> = 1;
assertContext;
