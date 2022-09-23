import type { AWS } from '@serverless/typescript';

export const createCounter: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/createCounter/handler.main',
};
