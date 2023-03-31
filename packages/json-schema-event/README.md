# JSON Schema Event

DRY Castore [`EventType`](https://github.com/castore-dev/castore/#--eventtype) definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)

## 📥 Installation

```bash
# npm
npm install @castore/json-schema-event

# yarn
yarn add @castore/json-schema-event
```

This package has `@castore/core` and `json-schema-to-ts` (above v2) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core json-schema-to-ts

# yarn
yarn add @castore/core json-schema-to-ts
```

## 👩‍💻 Usage

```ts
import { JSONSchemaEventType } from '@castore/json-schema-event';

const pokemonAppearedPayloadSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    level: { type: 'integer' },
  },
  required: ['name', 'level'],
  additionalProperties: false,
} as const; // 👈 Don't forget the "as const" statement
// (Cf json-schema-to-ts documentation)

const pokemonAppearedMetadataSchema = {
  type: 'object',
  properties: {
    trigger: { enum: ['random', 'scripted'] },
  },
  additionalProperties: false,
} as const;

// 👇 generics are correctly inferred
const pokemonAppearedEventType = new JSONSchemaEventType({
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

`JSONSchemaEventType` implements the [`EventType`](https://github.com/castore-dev/castore/#--eventtype) class and adds the following properties to it:

- <code>payloadSchema <i>(?object)</i></code>: The event type payload JSON schema

```ts
const payloadSchema = pokemonAppearedEventType.payloadSchema;
// => pokemonAppearedPayloadSchema
```

- <code>metadataSchema <i>(?object)</i></code>: The event type metadata JSON schema

```ts
const metadataSchema = pokemonAppearedEventType.metadataSchema;
// => pokemonAppearedMetadataSchema
```
