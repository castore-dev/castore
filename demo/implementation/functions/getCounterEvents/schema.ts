import { FromSchema } from 'json-schema-to-ts';

import { uuidSchema } from '@libs/schemas/uuid';

export const inputSchema = {
  type: 'object',
  properties: {
    counterId: uuidSchema,
  },
  required: ['counterId'],
  additionalProperties: false,
} as const;

export type Input = FromSchema<typeof inputSchema>;
