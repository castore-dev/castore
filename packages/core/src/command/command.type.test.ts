import { A } from 'ts-toolbelt';

import {
  Command,
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
} from './command.util.test';

// --- CLASS ---

const assertIncrementCounterExtendsCommand: A.Equals<
  typeof incrementCounter extends Command ? true : false,
  true
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
