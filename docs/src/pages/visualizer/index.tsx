import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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

const VisualizerPage = (): JSX.Element => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <BrowserOnly>
        {() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
          const Visualizer = require('@castore/react-visualizer').Visualizer;
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
};

export default VisualizerPage;
