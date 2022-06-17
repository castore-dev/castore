import { dynamoDBResources } from './dynamoDB';

export const resources = {
  Description: 'Event-Sourcing Prototype',
  Resources: {
    ...dynamoDBResources,
  },
};
