import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import globals from 'globals';

export default defineConfig([
  { ignores: ['dist/**', 'coverage/**', 'reports/**', '.stryker-tmp/**', 'site/**'] },
  {
    files: ['src/**/*.ts'],
    extends: [
      js.configs.recommended,
      ...tsPlugin.configs['flat/recommended'],
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
      globals: { ...globals.node, ...globals.jest },
    },
    plugins: { '@stylistic': stylistic },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ project: './tsconfig.json' })],
    },
    rules: {
      '@stylistic/indent': ['error', 2, { ignoredNodes: ['PropertyDefinition[decorators.length > 0]'] }],
      'max-len': ['error', { code: 180 }],
      'no-param-reassign': ['error', { ignorePropertyModificationsForRegex: ['^descriptor$'] }],
      'max-classes-per-file': 'off',
      'class-methods-use-this': ['error', { exceptMethods: ['foo', 'goo', 'boo'] }],
      'no-async-promise-executor': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'func-names': 'off',
      'import-x/prefer-default-export': 'off',
      'import-x/extensions': 'off',
      'import-x/no-extraneous-dependencies': 'off',
    },
  },
  {
    files: ['src/**/*.spec.ts'],
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },
]);
