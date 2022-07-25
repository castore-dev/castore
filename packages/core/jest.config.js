const commonConfig = require('../../commonConfiguration/jest.config');

const config = {
  ...commonConfig,
  rootDir: 'src',
  moduleDirectories: ['node_modules', '<rootDir>'],
};

module.exports = config;
