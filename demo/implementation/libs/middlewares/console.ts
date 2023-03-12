import middy from '@middy/core';
import type { MiddyfiedHandler } from '@middy/core';
import jsonValidator from '@middy/validator';
import { Callback, Context } from 'aws-lambda';
import { JSONSchema } from 'json-schema-to-ts';

interface ApplyMiddlewaresOptions {
  inputSchema?: JSONSchema;
}

export type Handler<
  EVENT = unknown,
  RESPONSE = unknown,
  CONTEXT extends Context = Context,
> = (
  event: EVENT,
  context: CONTEXT,
  callback: Callback<RESPONSE>,
) => Promise<RESPONSE>;

export const applyConsoleMiddleware = <
  EVENT,
  RESPONSE,
  CONTEXT extends Context,
>(
  handler?: Handler<EVENT, RESPONSE, CONTEXT>,
  options: ApplyMiddlewaresOptions = {},
): MiddyfiedHandler<EVENT, RESPONSE, Error, CONTEXT> => {
  const { inputSchema } = options;

  const middyfiedHandler = middy(handler);

  if (inputSchema !== undefined) {
    middyfiedHandler.use(jsonValidator({ inputSchema }));
  }

  return middyfiedHandler;
};
