import type { Aggregate } from '@castore/core';

export type TrainerAggregate = Aggregate & {
  name: string;
  caughtPokemonIds: string[];
  caughtPokemonsCount: number;
};
