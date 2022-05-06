const defaultPresets = [
  ['@babel/preset-typescript', { allowNamespaces: true }],
];

const defaultIgnores = [/.*\/(.*\.|)test\.tsx?/, /node_modules/, /dist/];

const defaultPlugins = [
  [
    'module-resolver',
    {
      root: ['./src'],
      extensions: ['.ts'],
    },
  ],
  '@babel/plugin-transform-runtime',
];

const presetsForESM = [
  [
    '@babel/preset-env',
    {
      modules: false,
    },
  ],
  ...defaultPresets,
];
const presetsForCJS = [
  [
    '@babel/preset-env',
    {
      modules: 'cjs',
    },
  ],
  ...defaultPresets,
];

module.exports = (plugins = []) => {
  return {
    env: {
      cjs: {
        presets: presetsForCJS,
      },
      esm: {
        presets: presetsForESM,
      },
    },
    ignore: defaultIgnores,
    plugins: [...plugins, ...defaultPlugins],
  };
};
