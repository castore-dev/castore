// Source: material-ui babel.config https://github.com/mui/material-ui/blob/master/babel.config.js

const getBabelConfig = api => {
  const useESModules = api.env('modern');

  const presets = [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        browserslistEnv: process.env.BABEL_ENV || process.env.NODE_ENV,
        modules: useESModules ? false : 'commonjs',
        shippedProposals: useESModules,
      },
    ],
    ['@babel/preset-react', { runtime: 'automatic' }],
    ['@babel/preset-typescript', { allowNamespaces: true }],
  ];

  const plugins = [
    'babel-plugin-optimize-clsx',
    // Need the following 3 proposals for all targets in .browserslistrc.
    // With our usage the transpiled loose mode is equivalent to spec mode.
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules,
        // any package needs to declare 7.4.4 as a runtime dependency. default is ^7.0.0
        version: '^7.4.4',
      },
    ],
    ['babel-plugin-transform-react-remove-prop-types', { mode: 'unsafe-wrap' }],
    [
      'module-resolver',
      { root: ['./src'], extensions: ['.ts', '.tsx'], alias: { '~': './src' } },
    ],
  ];

  return {
    assumptions: {
      noDocumentAll: true,
    },
    presets,
    plugins,
    ignore: [/@babel[\\|/]runtime/], // Fix a Windows issue.
    overrides: [
      {
        exclude: /\.test\.(js|ts|tsx)$/,
        plugins: ['@babel/plugin-transform-react-constant-elements'],
      },
    ],
  };
};

module.exports = getBabelConfig;
