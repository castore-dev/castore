// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonConfig = require('../../commonConfiguration/jest.config');

const config = {
  ...commonConfig,
  moduleNameMapper: {
    '^@libs(.*)$': '<rootDir>/libs$1',
    '^@functions(.*)$': '<rootDir>/functions$1',
    '^@resources(.*)$': '<rootDir>/resources$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
};

module.exports = config;
