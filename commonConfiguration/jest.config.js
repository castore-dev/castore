const commonConfig = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  testEnvironment: 'node',
  coverageReporters: ['json-summary'],
  testMatch: ['**/*.unit.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['/dist/'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  clearMocks: true,
  rootDir: 'src',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
  },
};

module.exports = commonConfig;
