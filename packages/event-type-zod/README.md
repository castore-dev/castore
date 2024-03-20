# Zod Event

DRY Castore [`EventType`](https://castore-dev.github.io/castore/docs/event-sourcing/events/) definition using [`zod`](https://github.com/colinhacks/zod).

## 📥 Installation

```bash
# npm
npm install @castore/event-type-zod

# yarn
yarn add @castore/event-type-zod
```

This package has `@castore/core` and `zod` (above v3) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core zod

# yarn
yarn add @castore/core zod
```

## 👩‍💻 Usage

```ts
import z from 'zod';

import { ZodEventType } from '@castore/event-type-zod';

const pokemonAppearedPayloadSchema = z.object({
  name: z.string(),
  level: z.number(),
});

const pokemonAppearedMetadataSchema = z.object({
  trigger: z.enum(['random', 'scripted']).optional(),
});

// 👇 generics are correctly inferred
const pokemonAppearedEventType = new ZodEventType({
  type: 'POKEMON_APPEARED',
  payloadSchema: pokemonAppearedPayloadSchema,
  metadataSchema: pokemonAppearedMetadataSchema,
});
```

👇 Equivalent to:

```ts
import { EventType } from '@castore/core';

const pokemonAppearedEventType = new EventType<
  'POKEMON_APPEARED',
  { name: string; level: number },
  { trigger?: 'random' | 'scripted' }
>({ type: 'POKEMON_APPEARED' });
```

## ⚙️ Properties & Methods

`ZodEventType` implements the [`EventType`](https://castore-dev.github.io/castore/docs/event-sourcing/events/) class and adds the following properties to it:

- <code>payloadSchema <i>(?object)</i></code>: The event type payload zod schema

```ts
const payloadSchema = pokemonAppearedEventType.payloadSchema;
// => pokemonAppearedPayloadSchema
```

- <code>metadataSchema <i>(?object)</i></code>: The event type metadata zod schema

```ts
const metadataSchema = pokemonAppearedEventType.metadataSchema;
// => pokemonAppearedMetadataSchema
```
