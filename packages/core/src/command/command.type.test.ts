import { A } from 'ts-toolbelt';

import { Command } from './command';
import {
  counterEventStore,
  incrementCounter,
  Input,
  Output,
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
  ) => Promise<Output>
> = 1;
assertIncrementCounterHandler;
