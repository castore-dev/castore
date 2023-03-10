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

const userCreatedPayloadSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'string' },
  },
  required: ['name', 'age'],
  additionalProperties: false,
} as const; // 👈 Don't forget the "as const" statement
// (Cf json-schema-to-ts documentation)

const userCreatedMetadataSchema = {
  type: 'object',
  properties: {
    invitedBy: { type: 'string' },
  },
  additionalProperties: false,
} as const;

// 👇 generics are correctly inferred
const userCreatedEventType = new JSONSchemaEventType({
  type: 'USER_CREATED',
  payloadSchema: userCreatedPayloadSchema,
  metadataSchema: userCreatedMetadataSchema,
});
```

👇 Equivalent to:

```ts
import { EventType } from '@castore/core';

const userCreatedEventType = new EventType<
  'USER_CREATED',
  { name: string; age: number },
  { invitedBy?: string }
>({ type: 'USER_CREATED' });
```

## ⚙️ Properties & Methods

`JSONSchemaEventType` implements the [`EventType`](https://github.com/castore-dev/castore/#--eventtype) class and adds the following properties to it:

- <code>payloadSchema <i>(?object)</i></code>: The event type payload JSON schema

```ts
const payloadSchema = userCreatedEventType.payloadSchema;
// => userCreatedPayloadSchema
```

- <code>metadataSchema <i>(?object)</i></code>: The event type metadata JSON schema

```ts
const metadataSchema = userCreatedEventType.metadataSchema;
// => userCreatedMetadataSchema
```
