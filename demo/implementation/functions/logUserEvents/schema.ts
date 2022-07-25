import { FromSchema } from 'json-schema-to-ts';

import { uuidSchema } from '~/libs/schemas/uuid';

export const inputSchema = {
  type: 'object',
  properties: {
    userId: uuidSchema,
  },
  required: ['userId'],
  additionalProperties: false,
} as const;

export type Input = FromSchema<typeof inputSchema>;
