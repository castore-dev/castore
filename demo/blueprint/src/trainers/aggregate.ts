import type { Aggregate } from '@castore/core';

export type TrainerAggregate = Aggregate & {
  name: string;
  catchedPokemonIds: string[];
  catchedPokemonsCount: number;
};
