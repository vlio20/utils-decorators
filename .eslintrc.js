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
    'object-curly-spacing': ['error', 'never'],
    'import/prefer-default-export': 'off',
    'max-len': ['error', {code: 120}],
    '@typescript-eslint/indent': ['error', 2],
    'no-param-reassign': ['error',
      {ignorePropertyModificationsForRegex: ['^descriptor$']}
    ],
    'max-classes-per-file': ['off'],
    'class-methods-use-this': ['error', {exceptMethods: ['foo', 'goo']}],
    'no-async-promise-executor': ['off']
  }
};
