import Head from '@docusaurus/Head';
import React from 'react';

import { BulletPoints } from './BulletPoints';
import { Description } from './Description';
import { Footer } from './Footer';
import { Title } from './Title';
import { TopLinks } from './TopLinks';

export const Home = (): JSX.Element => (
  <>
    <Head>
      <title>Castore | Event sourcing made easy</title>
      <meta
        name="description"
        content="Castore is a TypeScript library that makes Event Sourcing easy, a powerful paradigm that saves changes to your application state rather than the state itself."
      />
    </Head>
    <div className="flex flex-col gap-12 md:gap-16">
      <TopLinks />
      <div className="flex flex-col items-center gap-3 text-center px-4">
        <Title />
        <Description />
      </div>
      <BulletPoints />
    </div>
    <Footer />
  </>
);
