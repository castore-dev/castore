const generateImportOrderRule = require('../../commonConfiguration/generateImportOrderRule');

module.exports = {
  rules: generateImportOrderRule(__dirname),
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
