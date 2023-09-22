---
sidebar_position: 1
---

# 📅 Events

Event Sourcing is all about **saving changes in your application state**. Such changes are represented by **events**, and needless to say, they are quite important 🙃

Events that concern the same entity (like a `Pokemon`) are aggregated through a common id called `aggregateId` (and vice versa, events that have the same `aggregateId` represent changes of the same entity). The index of an event in such a serie of events is called its `version`.

![Events](../../assets/docSchemas/events.png)

In Castore, stored events (also called **event details**) always have exactly the following properties:

- <code>aggregateId <i>(string)</i></code>
- <code>version <i>(integer ≥ 1)</i></code>
- <code>timestamp <i>(string)</i></code>: A date in ISO 8601 format
- <code>type <i>(string)</i></code>: A string identifying the business meaning of the event
- <code>payload <i>(?any = never)</i></code>: A payload of any type
- <code>metadata <i>(?any = never)</i></code>: Some metadata of any type

```ts
import type { EventDetail } from '@castore/core';

type PokemonAppearedEventDetail = EventDetail<
  'POKEMON_APPEARED',
  { name: string; level: number },
  { trigger?: 'random' | 'scripted' }
>;

// 👇 Equivalent to:
type PokemonAppearedEventDetail = {
  aggregateId: string;
  version: number;
  timestamp: string;
  type: 'POKEMON_APPEARED';
  payload: { name: string; level: number };
  metadata: { trigger?: 'random' | 'scripted' };
};
```

Events are generally classified in **events types** (not to confuse with TS types). Castore lets you declare them via the `EventType` class:

```ts
import { EventType } from '@castore/core';

const pokemonAppearedEventType = new EventType<
  'POKEMON_APPEARED',
  { name: string; level: number },
  { trigger?: 'random' | 'scripted' }
>({ type: 'POKEMON_APPEARED' });
```

:::info

Note that we only provided TS types for `payload` and `metadata` properties. That is because, as stated in the [core design](../../../), **Castore is meant to be as flexible as possible**, and that includes the validation library you want to use (if any): The `EventType` class can be used directly if no validation is required, or implemented by [other classes](../4-packages.md#-event-types) which will add run-time validation methods to it 👍

:::

<details>
<summary>
  <b>🔧 Reference</b>
</summary>

**Constructor:**

- <code>type <i>(string)</i></code>: The event type

```ts
import { EventType } from '@castore/core';

const pokemonAppearedEventType = new EventType({
  type: 'POKEMON_APPEARED',
});
```

---

**Properties:**

- <code>type <i>(string)</i></code>: The event type

```ts
const eventType = pokemonAppearedEventType.type;
// => 'POKEMON_APPEARED'
```

---

**Type Helpers:**

- `EventTypeDetail`: Returns the event detail TS type of an `EventType`

```ts
import type { EventTypeDetail } from '@castore/core';

type PokemonAppearedEventTypeDetail = EventTypeDetail<
  typeof pokemonAppearedEventType
>;

// 👇 Equivalent to:
type PokemonCaughtEventTypeDetail = {
  aggregateId: string;
  version: number;
  timestamp: string;
  type: 'POKEMON_APPEARED';
  payload: { name: string; level: number };
  metadata: { trigger?: 'random' | 'scripted' };
};
```

- `EventTypesDetails`: Returns the events details of a list of `EventType`

```ts
import type { EventTypesDetails } from '@castore/core';

type PokemonEventTypeDetails = EventTypesDetails<
  [typeof pokemonAppearedEventType, typeof pokemonCaughtEventType]
>;
// => EventTypeDetail<typeof pokemonAppearedEventType>
// | EventTypeDetail<typeof pokemonCaughtEventType>
```

</details>
