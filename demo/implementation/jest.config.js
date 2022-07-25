// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonConfig = require('../../commonConfiguration/jest.config');

const config = {
  ...commonConfig,
  rootDir: '.',
  moduleDirectories: ['node_modules', '<rootDir>'],
};

module.exports = config;
