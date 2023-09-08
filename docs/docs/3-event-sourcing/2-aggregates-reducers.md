---
sidebar_position: 2
---

# 🔧 Aggregates / Reducers

Eventhough entities are stored as series of events, we still want to use a **simpler and stable interface to represent their states at a point in time** rather than directly using events. In Castore, it is implemented by a TS type called `Aggregate`.

:::note

☝️ Think of aggregates as _"what the data would look like in CRUD"_

:::

In Castore, aggregates necessarily contain an `aggregateId` and `version` properties (the `version` of the latest `event`). But for the rest, it's up to you 🤷‍♂️

For instance, we can include a `name`, `level` and `status` properties to our `PokemonAggregate`:

```ts
import type { Aggregate } from '@castore/core';

// Represents a Pokemon at a point in time
interface PokemonAggregate extends Aggregate {
  name: string;
  level: number;
  status: 'wild' | 'caught';
}

// 👇 Equivalent to:
interface PokemonAggregate {
  aggregateId: string;
  version: number;
  name: string;
  level: number;
  status: 'wild' | 'caught';
}
```

Aggregates are derived from their events by [reducing them](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) through a `reducer` function. It defines **how to update the aggregate when a new event is pushed**:

![Aggregate](../../assets/docSchemas/aggregate.png)

```ts
import type { Reducer } from '@castore/core';

const pokemonsReducer: Reducer<PokemonAggregate, PokemonEventDetails> = (
  pokemonAggregate,
  newEvent,
) => {
  const { version, aggregateId } = newEvent;

  switch (newEvent.type) {
    case 'POKEMON_APPEARED': {
      const { name, level } = newEvent.payload;

      // 👇 Return the next version of the aggregate
      return {
        aggregateId,
        version,
        name,
        level,
        status: 'wild',
      };
    }
    case 'POKEMON_CAUGHT':
      return { ...pokemonAggregate, version, status: 'caught' };
    case 'POKEMON_LEVELED_UP':
      return {
        ...pokemonAggregate,
        version,
        level: pokemonAggregate.level + 1,
      };
  }
};

const myPikachuAggregate: PokemonAggregate =
  myPikachuEvents.reduce(pokemonsReducer);
```

:::info

☝️ Aggregates are always **computed on the fly**, and NOT stored. Changing them does not require any data migration whatsoever.

:::
