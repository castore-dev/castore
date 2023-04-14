/** @type {import('dependency-cruiser').IConfiguration} */
const baseConfig = require('../../dependency-cruiser');
module.exports = {
  ...baseConfig,
  options: {
    ...baseConfig.options,
    exclude: {
      ...baseConfig.options.exclude,
      path: ['src/event/groupedEvent.ts'],
    },
  },
};
