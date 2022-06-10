import { JSONSchema } from 'json-schema-to-ts';
import middy from '@middy/core';
import type { MiddyfiedHandler } from '@middy/core';
// import jsonBodyParser from '@middy/http-json-body-parser';
import jsonValidator from '@middy/validator';
import { Callback, Context } from 'aws-lambda';

interface ApplyMiddlewaresOptions {
  inputSchema?: JSONSchema;
}

export type Handler<E = unknown, R = unknown, C extends Context = Context> = (
  event: E,
  context: C,
  callback: Callback<R>,
) => Promise<R>;

export const applyConsoleMiddleware = <T, R, C extends Context>(
  handler?: Handler<T, R, C>,
  options: ApplyMiddlewaresOptions = {},
): MiddyfiedHandler<T, R, Error, C> => {
  const { inputSchema } = options;

  const middyfiedHandler = middy(handler);

  // middyfiedHandler.use(jsonBodyParser());

  if (inputSchema !== undefined) {
    middyfiedHandler.use(jsonValidator({ inputSchema }));
  }

  return middyfiedHandler;
};
