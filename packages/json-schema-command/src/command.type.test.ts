import { FromSchema } from 'json-schema-to-ts';
import { A } from 'ts-toolbelt';

import { Command } from '@castore/core';

import { JSONSchemaCommand } from './command';
import {
  counterEventStore,
  createCounter,
  incrementCounter,
  incrementCounterA,
  incrementCounterANoOutput,
  incrementCounterNoOutput,
  inputSchema,
  outputSchema,
} from './command.fixtures.test';

type Input = FromSchema<typeof inputSchema>;
type Output = FromSchema<typeof outputSchema>;

// --- CLASS ---

const assertJsonSchemaCommandExtendsCommand: A.Extends<
  JSONSchemaCommand,
  Command
> = 1;
assertJsonSchemaCommandExtendsCommand;

const assertCreateCounterExtendsJsonSchemaCommand: A.Extends<
  typeof createCounter,
  JSONSchemaCommand
> = 1;
assertCreateCounterExtendsJsonSchemaCommand;

const assertCreateCounterExtendsCommand: A.Extends<
  typeof createCounter,
  Command
> = 1;
assertCreateCounterExtendsCommand;

const assertIncrementCounterExtendsJsonSchemaCommand: A.Extends<
  typeof incrementCounter,
  JSONSchemaCommand
> = 1;
assertIncrementCounterExtendsJsonSchemaCommand;

const assertIncrementCounterExtendsCommand: A.Extends<
  typeof incrementCounter,
  Command
> = 1;
assertIncrementCounterExtendsCommand;

const assertIncrementCounterNoOutputExtendsJsonSchemaCommand: A.Extends<
  typeof incrementCounterNoOutput,
  JSONSchemaCommand
> = 1;
assertIncrementCounterNoOutputExtendsJsonSchemaCommand;

const assertIncrementCounterNoOutputExtendsCommand: A.Extends<
  typeof incrementCounterNoOutput,
  Command
> = 1;
assertIncrementCounterNoOutputExtendsCommand;

const assertIncrementCounterAExtendsJsonSchemaCommand: A.Extends<
  typeof incrementCounterA,
  JSONSchemaCommand
> = 1;
assertIncrementCounterAExtendsJsonSchemaCommand;

const assertIncrementCounterAExtendsCommand: A.Extends<
  typeof incrementCounterA,
  Command
> = 1;
assertIncrementCounterAExtendsCommand;

const assertIncrementCounterANoOutputExtendsJsonSchemaCommand: A.Extends<
  typeof incrementCounterANoOutput,
  JSONSchemaCommand
> = 1;
assertIncrementCounterANoOutputExtendsJsonSchemaCommand;

const assertIncrementCounterANoOutputExtendsCommand: A.Extends<
  typeof incrementCounterANoOutput,
  Command
> = 1;
assertIncrementCounterANoOutputExtendsCommand;

// --- SCHEMAS ---

const assertIncrementCounterInputSchema: A.Equals<
  typeof incrementCounter.inputSchema,
  /**
   * @debt type "Find a way to remove undefined"
   */
  typeof inputSchema | undefined
> = 1;
assertIncrementCounterInputSchema;

const assertIncrementCounterOutputSchema: A.Equals<
  typeof incrementCounter.outputSchema,
  /**
   * @debt type "Find a way to remove undefined"
   */
  typeof outputSchema | undefined
> = 1;
assertIncrementCounterOutputSchema;

const assertIncrementCounterNoOutputInputSchema: A.Equals<
  typeof incrementCounterNoOutput.inputSchema,
  /**
   * @debt type "Find a way to remove undefined"
   */
  typeof inputSchema | undefined
> = 1;
assertIncrementCounterNoOutputInputSchema;

const assertIncrementCounterASchemaOutputSchema: A.Equals<
  typeof incrementCounterA.outputSchema,
  /**
   * @debt type "Find a way to remove undefined"
   */
  typeof outputSchema | undefined
> = 1;
assertIncrementCounterASchemaOutputSchema;

// --- HANDLER ---

const assertCreateCounterHandler: A.Equals<
  typeof createCounter.handler,
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any,
    requiredEventStores: [typeof counterEventStore],
    context: { generateUuid: () => string },
  ) => Promise<Input>
> = 1;
assertCreateCounterHandler;

const assertIncrementCounterHandler: A.Equals<
  typeof incrementCounter.handler,
  (
    input: Input,
    requiredEventStores: [typeof counterEventStore],
  ) => Promise<Output>
> = 1;
assertIncrementCounterHandler;

const assertIncrementCounterNoOutputHandler: A.Equals<
  typeof incrementCounterNoOutput.handler,
  (
    input: Input,
    requiredEventStores: [typeof counterEventStore],
  ) => Promise<void>
> = 1;
assertIncrementCounterNoOutputHandler;

const assertIncrementCounterAHandler: A.Equals<
  typeof incrementCounterA.handler,
  (
    /**
     * @debt type "input should be typed as unknown"
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any,
    requiredEventStores: [typeof counterEventStore],
  ) => Promise<Output>
> = 1;
assertIncrementCounterAHandler;

const assertIncrementCounterANoOutputHandler: A.Equals<
  typeof incrementCounterANoOutput.handler,
  (
    /**
     * @debt type "input should be typed as unknown"
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any,
    requiredEventStores: [typeof counterEventStore],
  ) => Promise<void>
> = 1;
assertIncrementCounterANoOutputHandler;
