import Link from '@docusaurus/Link';
import React from 'react';

const footerLinks = [
  {
    label: 'Theodo',
    to: 'https://www.theodo.fr/',
  },
  {
    label: 'Serverless by Theodo',
    to: 'https://dev.to/slsbytheodo',
  },
  {
    label: '@ThomasAribart Twitter',
    to: 'https://twitter.com/aribartt',
  },
];

export const Footer = (): JSX.Element => (
  <div className="navbar navbar--dark flex flex-col items-start justify-center p-10 text-sm shadow-xl shadow-black/10">
    <div className="mx-auto">
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {footerLinks.map(item => (
          <div key={item.to}>
            {item.to.startsWith('http') ? (
              <a href={item.to} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
          </div>
        ))}
      </div>
      <div className="text-center opacity-20 mt-2">
        &copy; {new Date().getFullYear()} Serverless by Theodo
      </div>
    </div>
  </div>
);
