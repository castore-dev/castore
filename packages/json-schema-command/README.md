# JSON Schema Command

DRY Castore [`Command`](https://github.com/castore-dev/castore/#-commands) definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts).

## 📥 Installation

```bash
# npm
npm install @castore/json-schema-command

# yarn
yarn add @castore/json-schema-command
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
import { tuple } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';

const createUserInputSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'string' },
  },
  required: ['name', 'age'],
  additionalProperties: false,
} as const; // 👈 Don't forget the "as const" statement
// (Cf json-schema-to-ts documentation)

const createUserOutputSchema = {
  type: 'object',
  properties: {
    userId: { type: 'string', format: 'uuid' },
  },
  required: ['userId'],
  additionalProperties: false,
} as const;

// 👇 generics are correctly inferred
const createUserCommand = new JSONSchemaCommand({
  commandId: 'CREATE_USER',
  requiredEventStores: tuple(userEventStore),
  inputSchema: createUserInputSchema,
  outputSchema: createUserOutputSchema,
  // 👇 handler input/output types are correctly inferred
  handler: async (commandInput, [userEventStore]) => {
    const { name, age } = commandInput;
    const userId = generateUuid();

    await userEventStore.pushEvent({
      aggregateId: userId,
      version: 1,
      type: 'USER_CREATED',
      timestamp: new Date().toISOString(),
      payload: { name, age },
    });

    return { userId };
  },
});
```

👇 Equivalent to:

```ts
import { Command } from '@castore/core';

type RequiredEventStores = [typeof userEventStore];
type CommandInput = { name: string; age: number };
type CommandOutput = { userId: string };

const createUserCommand = new Command<
  RequiredEventStores,
  RequiredEventStores,
  CommandInput,
  CommandOutput
>({
  commandId: 'CREATE_USER',
  requiredEventStores: [userEventStore],
  handler: async (commandInput, [userEventStore]) => {
    // ...same code
  },
});
```

## ⚙️ Properties & Methods

`JSONSchemaCommand` implements the [`Command`](https://github.com/castore-dev/castore/#-commands) class and adds the following properties to it:

- <code>inputSchema <i>(?object)</i></code>: The command input JSON schema

```ts
const inputSchema = createUserCommand.inputSchema;
// => createUserInputSchema
```

- <code>outputSchema <i>(?object)</i></code>: The command output JSON schema

```ts
const outputSchema = createUserCommand.outputSchema;
// => createUserOutputSchema
```
