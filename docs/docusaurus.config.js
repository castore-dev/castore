/* eslint-disable max-lines */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/vsLight');
const darkCodeTheme = require('prism-react-renderer/themes/vsDark');

// @ts-expect-error bad typing
lightCodeTheme.plain.backgroundColor = '#f8f8f8';
// @ts-expect-error bad typing
darkCodeTheme.plain.backgroundColor = '#242424';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Castore',
  tagline: 'Making Event Sourcing easy 😎',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://castore-dev.github.io/',

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/castore/',
  trailingSlash: true,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'castore-dev', // Usually your GitHub org/user name.
  projectName: 'castore', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/castore-social-card.jpg',
      navbar: {
        hideOnScroll: true,
        style: 'dark',
        title: 'Castore',
        logo: {
          alt: 'Castore Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          { to: '/visualizer', label: 'Visualizer', position: 'left' },
          {
            href: 'https://github.com/castore-dev/castore',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'CE0UH5LP81',
        // Public API key: it is safe to commit it
        apiKey: 'e648978d7a32ef5fa288a4e50ea4bf11',
        indexName: 'castore',
        searchPagePath: 'search',
      },
    }),
};

module.exports = config;
