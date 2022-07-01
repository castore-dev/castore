import type { AWS } from '@serverless/typescript';

export const deleteUser: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/deleteUser/handler.main',
};
