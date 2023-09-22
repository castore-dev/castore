import React from 'react';

import { Logo } from './Logo';

export const Title = (): JSX.Element => (
  <div className="flex gap-2 lg:gap-4 items-center">
    <Logo className="w-[40px] md:w-[60px] lg:w-[100px]" />
    <h1 className="inline-block font-black text-4xl md:text-6xl lg:text-7xl">
      <span className="inline-block text-transparent bg-clip-text bg-gradient-to-l bg-color-gradient">
        Castore
      </span>
    </h1>
  </div>
);
