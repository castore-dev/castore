import React from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuid } from 'uuid';

import { tuple } from '@castore/core';
import {
  pokemonsEventStore,
  trainersEventStore,
  startPokemonHuntCommand,
  wildPokemonAppearCommand,
  catchPokemonCommand,
  levelUpPokemonCommand,
} from '@castore/demo-blueprint';
import { Visualizer } from '@castore/react-visualizer';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Visualizer
      eventStores={[pokemonsEventStore, trainersEventStore]}
      commands={tuple(
        startPokemonHuntCommand,
        wildPokemonAppearCommand,
        catchPokemonCommand,
        levelUpPokemonCommand,
      )}
      contextsByCommandId={{
        START_POKEMON_HUNT: [{ generateUuid: uuid }],
        WILD_POKEMON_APPEAR: [{ generateUuid: uuid }],
      }}
    />
  </React.StrictMode>,
  document.getElementById('root'),
);
