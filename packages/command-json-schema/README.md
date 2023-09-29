# JSON Schema Command

DRY Castore [`Command`](https://github.com/castore-dev/castore/#--command) definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts).

## 📥 Installation

```bash
# npm
npm install @castore/command-json-schema

# yarn
yarn add @castore/command-json-schema
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
import { JSONSchemaCommand } from '@castore/command-json-schema';
import { tuple } from '@castore/core';

const pokemonAppearedInputSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    level: { type: 'integer' },
  },
  required: ['name', 'level'],
  additionalProperties: false,
} as const; // 👈 Don't forget the "as const" statement
// (Cf json-schema-to-ts documentation)

const pokemonAppearedOutputSchema = {
  type: 'object',
  properties: {
    pokemonId: { type: 'string', format: 'uuid' },
  },
  required: ['pokemonId'],
  additionalProperties: false,
} as const;

// 👇 generics are correctly inferred
const pokemonAppearCommand = new JSONSchemaCommand({
  commandId: 'POKEMON_APPEAR',
  requiredEventStores: tuple(pokemonsEventStore),
  inputSchema: pokemonAppearedInputSchema,
  outputSchema: pokemonAppearedOutputSchema,
  // 👇 handler input/output types are correctly inferred
  handler: async (commandInput, [pokemonsEventStore]) => {
    const { name, level } = commandInput;
    const pokemonId = generateUuid();

    await pokemonsEventStore.pushEvent({
      aggregateId: pokemonId,
      version: 1,
      type: 'POKEMON_APPEARED',
      timestamp: new Date().toISOString(),
      payload: { name, level },
    });

    return { pokemonId };
  },
});
```

👇 Equivalent to:

```ts
import { Command } from '@castore/core';

type RequiredEventStores = [typeof pokemonsEventStore];
type CommandInput = { name: string; level: number };
type CommandOutput = { pokemonId: string };

const pokemonAppearCommand = new Command<
  RequiredEventStores,
  RequiredEventStores,
  CommandInput,
  CommandOutput
>({
  commandId: 'POKEMON_APPEAR',
  requiredEventStores: [pokemonsEventStore],
  handler: async (commandInput, [pokemonsEventStore]) => {
    // ...same code
  },
});
```

## ⚙️ Properties & Methods

`JSONSchemaCommand` implements the [`Command`](https://github.com/castore-dev/castore/#--command) class and adds the following properties to it:

- <code>inputSchema <i>(?object)</i></code>: The command input JSON schema

```ts
const inputSchema = pokemonAppearCommand.inputSchema;
// => pokemonAppearedInputSchema
```

- <code>outputSchema <i>(?object)</i></code>: The command output JSON schema

```ts
const outputSchema = pokemonAppearCommand.outputSchema;
// => pokemonAppearedOutputSchema
```
