import type { AWS } from '@serverless/typescript';

export const logAggregateIds: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/logAggregateIds/handler.main',
};
