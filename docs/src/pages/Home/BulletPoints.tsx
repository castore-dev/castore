import React from 'react';
import { BsStars } from 'react-icons/bs';
import { FaPuzzlePiece, FaHandHoldingHeart } from 'react-icons/fa';

export const BulletPoints = (): JSX.Element => (
  <div className="text-lg flex flex-col gap-12 p-8 max-w-[1200px] mx-auto md:flex-row">
    <div className="flex-1 flex flex-col gap-8 items-center max-w-[400px]">
      <BsStars className="text-primary-light text-6xl" />
      <div className="flex flex-col gap-1 text-center">
        <h3 className="uppercase text-xl font-black">Stack Agnostic</h3>
        <p className="text-sm dark:text-gray-200 leading-6">
          Castore is in <strong>TypeScript</strong>. Outside from that, it can
          be used pretty much <strong>anywhere</strong>: React apps, containers,
          Lambdas... you name it 🙌
        </p>
        <p className="text-sm dark:text-gray-200 leading-6">
          For instance, <code>EventStore</code> classes are{' '}
          <strong>stack agnostic</strong>: They need an{' '}
          <code>EventStorageAdapter</code> class to interact with actual data.
        </p>
        <p className="text-sm dark:text-gray-200 leading-6">
          You can code your own <code>EventStorageAdapter</code> (simply
          implement the interface), but it's much simpler to use off-the-shelf
          adapters like the{' '}
          <a href="https://www.npmjs.com/package/@castore/dynamodb-event-storage-adapter">
            DynamoDBEventStorageAdapter
          </a>
          .
        </p>
      </div>
    </div>
    <div className="flex-1 flex flex-col gap-8 items-center max-w-[400px]">
      <FaPuzzlePiece className="text-primary-lightest text-6xl" />
      <div className="flex flex-col gap-1 text-center">
        <h3 className="uppercase text-center text-xl font-black">
          Modular & Type-safe
        </h3>
        <p className="text-sm dark:text-gray-200 leading-6">
          Castore is a{' '}
          <strong>collection of utility classes and helpers</strong>, but NOT a
          framework: While some classes require compatible infrastructure,
          Castore is not responsible for deploying it.
        </p>
        <p className="text-sm dark:text-gray-200 leading-6">
          Though that is not something we exclude in the future, we are a small
          team and decided to focus on DevX first.
        </p>
        <p className="text-sm dark:text-gray-200 leading-6">
          Speaking of DevX, we absolutely love TypeScript! If you do too, you're
          in the right place: We <strong>push type-safety to the limit</strong>{' '}
          in everything we do!
        </p>
      </div>
    </div>
    <div className="flex-1 flex flex-col gap-8 items-center max-w-[400px]">
      <FaHandHoldingHeart className="text-primary-lighter text-6xl" />
      <div className="flex flex-col gap-1 text-center">
        <h3 className="uppercase text-center text-xl font-black">
          Comprehensive
        </h3>
        <p className="text-sm dark:text-gray-200 leading-6">
          The Event Sourcing journey has many hidden pitfalls.{' '}
          <strong>We ran into them for you</strong>!
        </p>
        <p className="text-sm dark:text-gray-200 leading-6">
          Castore is opiniated. It comes with a collection of best practices and
          documented anti-patterns that we hope will help you out!
        </p>
        <p className="text-sm dark:text-gray-200 leading-6">
          It also comes with an awesome collection of packages that will make
          your life easy, e.g. when working on{' '}
          <a href="https://www.npmjs.com/package/@castore/test-tools">
            unit tests
          </a>
          ,{' '}
          <a href="https://www.npmjs.com/package/@castore/dam">
            data migration
          </a>{' '}
          or{' '}
          <a href="https://www.npmjs.com/package/@castore/react-visualizer">
            data modelling
          </a>
          .
        </p>
      </div>
    </div>
  </div>
);
