const { readdirSync } = require('fs');
const path = require('path');

const filterDirent = dirent =>
  dirent.isDirectory() ||
  (dirent.name.includes('.ts') && !dirent.name.includes('.test.ts'));

const formatPathGroupsFromDirent = dirent => ({
  pattern: dirent.isDirectory()
    ? `${dirent.name}{,/**}`
    : dirent.name.replace('.ts', ''),
  group: 'internal',
});

const generateImportOrderRule = (dirname, tsConfigPath = 'tsconfig.json') => {
  const tsConfig = require(path.resolve(dirname, tsConfigPath));

  const tsConfigPaths = Object.keys(tsConfig.compilerOptions.paths || {}).map(
    compilerOptionPath => ({
      pattern: `${compilerOptionPath}*`,
      group: 'internal',
    }),
  );

  const baseUrlPaths = readdirSync(
    path.resolve(dirname, tsConfig.compilerOptions.baseUrl || ''),
    {
      withFileTypes: true,
    },
  )
    .filter(filterDirent)
    .map(formatPathGroupsFromDirent);

  const pathGroups = [...tsConfigPaths, ...baseUrlPaths];

  return {
    'import/order': [
      'error',
      {
        pathGroups: [
          { pattern: '@castore/**', group: 'unknown' },
          ...pathGroups,
        ],
        groups: [
          ['external', 'builtin'],
          'unknown',
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        'newlines-between': 'always',
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
  };
};

module.exports = generateImportOrderRule;
