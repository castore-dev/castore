import Link from '@docusaurus/Link';
import React from 'react';
import { FaRegCopy, FaGithub, FaHeart } from 'react-icons/fa';
import { MdOutlineImportContacts } from 'react-icons/md';
import { SlSpeech } from 'react-icons/sl';

type Link = { id: string; label: JSX.Element; to: string };

const links: Link[] = [
  {
    id: 'docs',
    label: (
      <div className="flex items-center gap-2">
        <MdOutlineImportContacts className="text-lg" /> Docs
      </div>
    ),
    to: './docs/installation',
  },
  {
    id: 'github',
    label: (
      <div className="flex items-center gap-2">
        <FaGithub className="text-lg" /> GitHub
      </div>
    ),
    to: 'https://github.com/castore-dev/castore',
  },
  {
    id: 'examples',
    label: (
      <div className="flex items-center gap-2">
        <FaRegCopy className="text-lg" /> Examples
      </div>
    ),
    to: 'https://github.com/castore-dev/castore/tree/main/demo/blueprint/src',
  },
  {
    id: 'sponsor',
    label: (
      <div className="flex items-center gap-2">
        <FaHeart className="text-lg" /> Sponsor
      </div>
    ),
    to: 'https://github.com/sponsors/ThomasAribart',
  },
  {
    id: 'contact',
    label: (
      <div className="flex items-center gap-2">
        <SlSpeech className="text-lg" /> Contact
      </div>
    ),
    to: 'mailto:thomasa@theodo.fr',
  },
];

export const TopLinks = (): JSX.Element => (
  <div className="flex flex-wrap py-2 px-4 items-center justify-center text-sm max-w-screen-xl mx-auto md:text-base md:self-end">
    {links.map(({ id, label, to }) => {
      const children = (
        <div className="p-2 opacity-90 hover:opacity-100">{label}</div>
      );

      return (
        <div key={id} className="hover:underline">
          {to.startsWith('http') || to.startsWith('mailto') ? (
            <a href={to}>{children}</a>
          ) : (
            <Link to={to}>{children}</Link>
          )}
        </div>
      );
    })}
  </div>
);
