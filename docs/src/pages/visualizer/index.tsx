import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import React from 'react';

import { tuple } from '@castore/core';
import {
  pokemonsEventStore,
  trainersEventStore,
  startPokemonGameCommand,
  wildPokemonAppearCommand,
  catchPokemonCommand,
  levelUpPokemonCommand,
} from '@castore/demo-blueprint';

import './index.css';

const VisualizerPage = (): JSX.Element => (
  <Layout
    title="Visualizer"
    description="Castore is a TypeScript library that makes Event Sourcing easy, a powerful paradigm that saves changes to your application state rather than the state itself."
  >
    <BrowserOnly>
      {() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
        const Visualizer = require('@castore/lib-react-visualizer').Visualizer;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
        const uuid = require('uuid').v4 as () => string;

        return (
          <Visualizer
            eventStores={[pokemonsEventStore, trainersEventStore]}
            /**
             * @debt improvement "we probably don't have to use tuple here"
             */
            commands={tuple(
              startPokemonGameCommand,
              wildPokemonAppearCommand,
              catchPokemonCommand,
              levelUpPokemonCommand,
            )}
            contextsByCommandId={{
              START_POKEMON_GAME: [{ generateUuid: uuid }],
              WILD_POKEMON_APPEAR: [{ generateUuid: uuid }],
            }}
          />
        );
      }}
    </BrowserOnly>
  </Layout>
);

export default VisualizerPage;
