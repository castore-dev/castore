import type { FromSchema } from 'json-schema-to-ts';

import { uuidSchema } from '~/libs/schemas/uuid';

export const inputSchema = {
  type: 'object',
  properties: {
    pokemonId: uuidSchema,
  },
  required: ['pokemonId'],
  additionalProperties: false,
} as const;

export type Input = FromSchema<typeof inputSchema>;
