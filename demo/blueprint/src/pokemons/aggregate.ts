import type { Aggregate } from '@castore/core';

export type PokemonAggregate = Aggregate & {
  name: string;
  level: number;
} & (
    | { status: 'wild'; trainerId?: undefined }
    | { status: 'catched'; trainerId: string }
  );
