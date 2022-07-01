import type { AWS } from '@serverless/typescript';

export const logUserEvents: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/logUserEvents/handler.main',
};
