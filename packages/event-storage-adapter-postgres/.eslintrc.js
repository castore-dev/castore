module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {
    // Disable unsafe member access/assignment/call rules since we're working with Postgres types
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',

    // Allow type assertions since we need them for Postgres row types
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',

    // Allow empty interfaces for Postgres generic types
    '@typescript-eslint/no-empty-interface': 'off',

    // Disable max-lines warning since DB adapters tend to be larger
    'max-lines': 'off',

    // Allow non-null assertions when working with DB results
    '@typescript-eslint/no-non-null-assertion': 'off',

    // Allow boolean type coercion for DB values
    '@typescript-eslint/strict-boolean-expressions': 'off',
  },
};
