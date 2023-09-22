import Link from '@docusaurus/Link';
import React from 'react';

export const Description = (): JSX.Element => (
  <>
    <h2 className="font-regular text-2xl max-w-md md:text-3xl lg:text-5xl lg:max-w-2xl">
      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r bg-color-gradient">
        Event sourcing
      </span>{' '}
      made easy
    </h2>
    <p className="text opacity-90 max-w-[500px] lg:text-xl lg:max-w-[600px]">
      <a href="https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing">
        Event Sourcing
      </a>{' '}
      is a data storage paradigm that saves{' '}
      <strong>changes in your application state</strong> rather than the state
      itself.
    </p>
    <p className="text opacity-90 max-w-[500px] lg:text-xl lg:max-w-[600px]">
      It is powerful as it enables{' '}
      <strong>rewinding to a previous state</strong> and{' '}
      <strong>exploring audit trails</strong> for debugging or business/legal
      purposes. It also integrates very well with{' '}
      <a href="https://en.wikipedia.org/wiki/Event-driven_architecture">
        event-driven architectures
      </a>
      .
    </p>
    <p className="text opacity-90 max-w-[500px] lg:text-xl lg:max-w-[600px]">
      However, it is <strong>tricky to implement</strong> 😅
    </p>
    <p className="text opacity-90 max-w-[500px] lg:text-xl lg:max-w-[600px]">
      ...well, <strong>not anymore</strong> 💪
    </p>
    <Link
      to="./docs/installation"
      className="py-2 px-4 bg-gradient-to-r bg-color-gradient rounded text-white uppercase font-extrabold"
    >
      👉 Get Started
    </Link>
  </>
);
