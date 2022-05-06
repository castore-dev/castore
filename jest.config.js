/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  preset: 'ts-jest',
  testTimeout: 20000,
  testEnvironment: 'node',
  roots: ['<rootDir>', '<rootDir>/src'],
  /**
   * @debt refacto "Find a way to link moduleNameMapper and tsconfig.paths"
   */
  moduleNameMapper: {
    '^@libs(.*)$': '<rootDir>/src$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: [],
  coverageReporters: ['json-summary'],
  clearMocks: true,
};
