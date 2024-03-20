# Zod Command

DRY Castore [`Command`](https://castore-dev.github.io/castore/docs/event-sourcing/pushing-events/) definition using [`zod`](https://github.com/colinhacks/zod).

## 📥 Installation

```bash
# npm
npm install @castore/command-zod

# yarn
yarn add @castore/command-zod
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

import { ZodCommand } from '@castore/command-zod';
import { tuple } from '@castore/core';

const pokemonAppearedInputSchema = z.object({
  name: z.string(),
  level: z.number(),
});

const pokemonAppearedOutputSchema = z.object({
  pokemonId: z.string().uuid(),
});

// 👇 generics are correctly inferred
const pokemonAppearCommand = new ZodCommand({
  commandId: 'POKEMON_APPEAR',
  requiredEventStores: tuple(pokemonsEventStore),
  inputSchema: pokemonAppearedInputSchema,
  outputSchema: pokemonAppearedOutputSchema,
  // 👇 handler input/output types are correctly inferred
  handler: async (
    commandInput,
    [pokemonsEventStore],
    { generateUuid }: { generateUuid: () => string },
  ) => {
    const { name, level } = commandInput;
    const pokemonId = generateUuid();

    await pokemonsEventStore.pushEvent({
      aggregateId: pokemonId,
      version: 1,
      type: 'POKEMON_APPEARED',
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

`ZodCommand` implements the [`Command`](https://castore-dev.github.io/castore/docs/event-sourcing/pushing-events/) class and adds the following properties to it:

- <code>inputSchema <i>(?object)</i></code>: The command input zod schema

```ts
const inputSchema = pokemonAppearCommand.inputSchema;
// => pokemonAppearedInputSchema
```

- <code>outputSchema <i>(?object)</i></code>: The command output zod schema

```ts
const outputSchema = pokemonAppearCommand.outputSchema;
// => pokemonAppearedOutputSchema
```
