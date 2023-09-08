import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';

import styles from './index.module.css';

const HomepageHeader = (): JSX.Element => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction"
          >
            Get started!
          </Link>
        </div>
      </div>
    </header>
  );
};

const Home = (): JSX.Element => (
  <Layout
    title="Event sourcing made easy"
    description="Castore is a TypeScript library that makes Event Sourcing easy, a powerful paradigm that saves changes to your application state rather than the state itself."
  >
    <HomepageHeader />
  </Layout>
);

export default Home;
