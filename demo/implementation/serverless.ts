import type { AWS } from '@serverless/typescript';

import { functions } from './functions';
import { resources } from './resources';

const serverlessConfiguration: AWS = {
  service: 'castore-demo',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    architecture: 'arm64',
    stage: '${env:STAGE}',
    profile: '${env:PROFILE}',
    region: '${env:REGION}' as AWS['provider']['region'],
    apiGateway: {
      minimumCompressionSize: 1024, // Enable gzip compression for responses > 1 KB
    },
    endpointType: 'REGIONAL',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SERVICE: '${self:service}',
      STAGE: '${self:provider.stage}',
      USER_EVENTS_TABLE_NAME: { Ref: 'UserEventsTable' },
      COUNTER_EVENTS_TABLE_NAME: { Ref: 'CounterEventsTable' },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Resource: [
              { 'Fn::GetAtt': ['UserEventsTable', 'Arn'] },
              { 'Fn::GetAtt': ['CounterEventsTable', 'Arn'] },
              {
                'Fn::Join': [
                  '/',
                  [{ 'Fn::GetAtt': ['UserEventsTable', 'Arn'] }, 'index/*'],
                ],
              },
              {
                'Fn::Join': [
                  '/',
                  [{ 'Fn::GetAtt': ['CounterEventsTable', 'Arn'] }, 'index/*'],
                ],
              },
            ],
            Action: [
              'dynamodb:GetItem',
              'dynamodb:Query',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:BatchWriteItem',
            ],
          },
        ],
      },
    },
  },
  functions,
  resources,
  package: {
    individually: true,
  },
  custom: {
    esbuild: {
      packager: 'yarn',
      bundle: true,
      minify: true,
      sourcemap: true,
      target: 'node14',
      keepNames: true,
      define: { 'require.resolve': undefined },
      platform: 'node',
      exclude: ['aws-sdk'],
      // For correct treeshaking we specify module first (ESM)
      // Because it defaults to "main" first (CJS, not tree shakeable)
      // https://esbuild.github.io/api/#main-fields
      mainFields: ['module', 'main'],
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
