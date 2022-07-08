const commonConfig = require('../../commonConfiguration/jest.config');

const config = {
  ...commonConfig,
  moduleDirectories: ['node_modules', '<rootDir>'],
};

module.exports = config;
