# JSON Schema Event

DRY Castore [`EventType`](https://github.com/castore-dev/castore/#-eventtype) definition using [`zod`](https://github.com/colinhacks/zod).

## 📥 Installation

```bash
# npm
npm install @castore/zod-event

# yarn
yarn add @castore/zod-event
```

This package has `castore/core` and `zod` (above v3) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core zod

# yarn
yarn add @castore/core zod
```

## 👩‍💻 Usage

```ts
import z from 'zod';

import { ZodEventType } from '@castore/zod-event';

const userCreatedPayloadSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const userCreatedMetadataSchema = z.object({
  invitedBy: z.string().optional(),
});

// 👇 generics are correctly inferred
const userCreatedEventType = new ZodEventType({
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

`ZodEventType` implements the [`EventType`](https://github.com/castore-dev/castore/#-eventtype) class and adds the following properties to it:

- <code>payloadSchema <i>(?object)</i></code>: The event type payload zod schema

```ts
const payloadSchema = userCreatedEventType.payloadSchema;
// => userCreatedPayloadSchema
```

- <code>metadataSchema <i>(?object)</i></code>: The event type metadata zod schema

```ts
const metadataSchema = userCreatedEventType.metadataSchema;
// => userCreatedMetadataSchema
```
