import UndrawDocusaurusMountain from '@site/static/img/undraw_docusaurus_mountain.svg';
import UndrawDocusaurusReact from '@site/static/img/undraw_docusaurus_react.svg';
import UndrawDocusaurusTree from '@site/static/img/undraw_docusaurus_tree.svg';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    Svg: UndrawDocusaurusMountain,
    description: <></>,
  },
  {
    title: 'Focus on What Matters',
    Svg: UndrawDocusaurusTree,
    description: <></>,
  },
  {
    title: 'Powered by React',
    Svg: UndrawDocusaurusReact,
    description: <></>,
  },
];

const Feature = ({ title, Svg, description }: FeatureItem) => (
  <div className={clsx('col col--4')}>
    <div className="text--center">
      {/* @ts-ignore Svg component will be removed */}
      <Svg className={styles.featureSvg} role="img" />
    </div>
    <div className="text--center padding-horiz--md">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

const HomepageFeatures = (): JSX.Element => (
  <section className={styles.features}>
    <div className="container">
      <div className="row">
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </div>
  </section>
);

export default HomepageFeatures;
