import type { AWS } from '@serverless/typescript';

export const createUser: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/createUser/handler.main',
};
