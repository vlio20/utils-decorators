module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'max-len': ['error', {code: 180}],
    '@typescript-eslint/indent': ['error', 2],
    'no-param-reassign': ['error',
      {ignorePropertyModificationsForRegex: ['^descriptor$']}
    ],
    'max-classes-per-file': ['off'],
    'class-methods-use-this': ['error', {exceptMethods: ['foo', 'goo', 'boo']}],
    'no-async-promise-executor': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    'func-names': ['off'],
  }
};
