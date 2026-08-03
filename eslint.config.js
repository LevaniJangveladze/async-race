const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const { configs: airbnb, plugins: airbnbPlugins } = require('eslint-config-airbnb-extended');
const prettierConfig = require('eslint-config-prettier/flat');

const MAX_FUNCTION_LINES = 40;

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      airbnbPlugins.stylistic,
      airbnbPlugins.importX,
      ...airbnb.base.recommended,
      ...airbnb.base.typescript,
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      prettierConfig,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'import-x/prefer-default-export': 'off',
      'no-console': ['error', { allow: ['error'] }],
      'max-lines-per-function': [
        'error',
        { max: MAX_FUNCTION_LINES, skipBlankLines: true, skipComments: true },
      ],
      'no-magic-numbers': [
        'error',
        { ignore: [0, 1, -1], ignoreArrayIndexes: true, enforceConst: true },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
