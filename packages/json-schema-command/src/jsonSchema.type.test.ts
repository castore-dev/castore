import { FromSchema } from 'json-schema-to-ts';
import { A } from 'ts-toolbelt';

import { Command } from '@castore/core';

import { JSONSchemaCommand } from './jsonSchema';
import {
  counterEventStore,
  incrementCounter,
  incrementCounterA,
  incrementCounterANoOutput,
  incrementCounterNoOutput,
  inputSchema,
  outputSchema,
  userEventStore,
} from './jsonSchema.util.test';

type Input = FromSchema<typeof inputSchema>;
type Output = FromSchema<typeof outputSchema>;

// --- EVENTS DETAILS ---

const assertJsonSchemaCommandExtendsCommand: A.Equals<
  JSONSchemaCommand extends Command ? true : false,
  true
> = 1;
assertJsonSchemaCommandExtendsCommand;

const assertIncrementCounterExtendsJsonSchemaCommand: A.Equals<
  typeof incrementCounter extends JSONSchemaCommand ? true : false,
  true
> = 1;
assertIncrementCounterExtendsJsonSchemaCommand;

const assertIncrementCounterExtendsCommand: A.Equals<
  typeof incrementCounter extends Command ? true : false,
  true
> = 1;
assertIncrementCounterExtendsCommand;

const assertIncrementCounterNoOutputExtendsJsonSchemaCommand: A.Equals<
  typeof incrementCounterNoOutput extends JSONSchemaCommand ? true : false,
  true
> = 1;
assertIncrementCounterNoOutputExtendsJsonSchemaCommand;

const assertIncrementCounterNoOutputExtendsCommand: A.Equals<
  typeof incrementCounterNoOutput extends Command ? true : false,
  true
> = 1;
assertIncrementCounterNoOutputExtendsCommand;

const assertIncrementCounterAExtendsJsonSchemaCommand: A.Equals<
  typeof incrementCounterA extends JSONSchemaCommand ? true : false,
  true
> = 1;
assertIncrementCounterAExtendsJsonSchemaCommand;

const assertIncrementCounterAExtendsCommand: A.Equals<
  typeof incrementCounterA extends Command ? true : false,
  true
> = 1;
assertIncrementCounterAExtendsCommand;

const assertIncrementCounterANoOutputExtendsJsonSchemaCommand: A.Equals<
  typeof incrementCounterANoOutput extends JSONSchemaCommand ? true : false,
  true
> = 1;
assertIncrementCounterANoOutputExtendsJsonSchemaCommand;

const assertIncrementCounterANoOutputExtendsCommand: A.Equals<
  typeof incrementCounterANoOutput extends Command ? true : false,
  true
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

const assertIncrementCounterHandler: A.Equals<
  typeof incrementCounter.handler,
  (
    input: Input,
    requiredEventStores: [typeof counterEventStore, typeof userEventStore],
  ) => Promise<Output>
> = 1;
assertIncrementCounterHandler;

const assertIncrementCounterNoOutputHandler: A.Equals<
  typeof incrementCounterNoOutput.handler,
  (
    input: Input,
    requiredEventStores: [typeof counterEventStore, typeof userEventStore],
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
    requiredEventStores: [typeof counterEventStore, typeof userEventStore],
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
    requiredEventStores: [typeof counterEventStore, typeof userEventStore],
  ) => Promise<void>
> = 1;
assertIncrementCounterANoOutputHandler;
