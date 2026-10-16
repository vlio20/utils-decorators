import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import globals from 'globals';

// Separate statements containing array iteration calls, including assignments and chains.
const arrayIterationStatement = {
  selector: ':matches(ExpressionStatement, VariableDeclaration, ReturnStatement, ThrowStatement):has('
    + 'CallExpression[callee.type="MemberExpression"]:matches('
    + '[callee.computed=false][callee.property.name=/^(forEach|map|flatMap|filter|reduce|reduceRight|some|every|find|findIndex|findLast|findLastIndex|sort|toSorted)$/], '
    + '[callee.computed=true][callee.property.value=/^(forEach|map|flatMap|filter|reduce|reduceRight|some|every|find|findIndex|findLast|findLastIndex|sort|toSorted)$/]))',
};

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
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: ['return', 'throw'] },
        { blankLine: 'always', prev: '*', next: ['block', 'if', 'for', 'while', 'do', 'switch', 'try'] },
        { blankLine: 'always', prev: ['block', 'if', 'for', 'while', 'do', 'switch', 'try'], next: '*' },
        { blankLine: 'always', prev: '*', next: arrayIterationStatement },
        { blankLine: 'always', prev: arrayIterationStatement, next: '*' },
      ],
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
