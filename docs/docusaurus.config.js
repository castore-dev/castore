/* eslint-disable max-lines */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

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
      // Replace with your project's social card
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
        theme: {
          plain: {
            color: '#393A34',
            backgroundColor: '#f6f8fa',
          },
          styles: [
            {
              types: ['comment', 'prolog', 'doctype', 'cdata'],
              style: {
                color: '#999988',
                fontStyle: 'italic',
              },
            },
            {
              types: ['namespace'],
              style: {
                opacity: 0.7,
              },
            },
            {
              types: ['string', 'attr-value'],
              style: {
                color: '#e3116c',
              },
            },
            {
              types: ['punctuation', 'operator'],
              style: {
                color: '#393A34',
              },
            },
            {
              types: [
                'entity',
                'url',
                'symbol',
                'number',
                'boolean',
                'variable',
                'constant',
                'property',
                'regex',
                'inserted',
              ],
              style: {
                color: '#36acaa',
              },
            },
            {
              types: ['atrule', 'keyword', 'attr-name', 'selector'],
              style: {
                color: '#00a4db',
              },
            },
            {
              types: ['function', 'deleted', 'tag'],
              style: {
                color: '#d73a49',
              },
            },
            {
              types: ['function-variable'],
              style: {
                color: '#6f42c1',
              },
            },
            {
              types: ['tag', 'selector', 'keyword'],
              style: {
                color: '#00009f',
              },
            },
          ],
        },
        darkTheme: {
          plain: {
            color: '#F8F8F2',
            backgroundColor: '#282A36',
          },
          styles: [
            {
              types: ['prolog', 'constant', 'builtin'],
              style: {
                color: 'rgb(189, 147, 249)',
              },
            },
            {
              types: ['inserted', 'function'],
              style: {
                color: 'rgb(80, 250, 123)',
              },
            },
            {
              types: ['deleted'],
              style: {
                color: 'rgb(255, 85, 85)',
              },
            },
            {
              types: ['changed'],
              style: {
                color: 'rgb(255, 184, 108)',
              },
            },
            {
              types: ['punctuation', 'symbol'],
              style: {
                color: 'rgb(248, 248, 242)',
              },
            },
            {
              types: ['string', 'char', 'tag', 'selector'],
              style: {
                color: 'rgb(255, 121, 198)',
              },
            },
            {
              types: ['keyword', 'variable'],
              style: {
                color: 'rgb(189, 147, 249)',
                fontStyle: 'italic',
              },
            },
            {
              types: ['comment'],
              style: {
                color: 'rgb(98, 114, 164)',
              },
            },
            {
              types: ['attr-name'],
              style: {
                color: 'rgb(241, 250, 140)',
              },
            },
          ],
        },
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
