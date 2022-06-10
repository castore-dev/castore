import type { AWS } from '@serverless/typescript';

export const getCounterEvents: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/getCounterEvents/handler.main',
};
