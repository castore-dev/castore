import type { AWS } from '@serverless/typescript';

export const incrementCounter: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/incrementCounter/handler.main',
};
