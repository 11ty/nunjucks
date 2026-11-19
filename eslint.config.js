const { defineConfig, globalIgnores } = require('eslint/config');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = defineConfig([
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: { ...globals.node, nunjucks: false },
    },

    rules: {
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'no-cond-assign': ['error', 'except-parens'],
      'no-unused-vars': [
        'error',
        {
          args: 'none',
          caughtErrors: 'none',
        },
      ],
      'no-useless-escape': 'off',
    },
  },
  globalIgnores([
    '**/node_modules',
    '**/spm_modules',
    '**/coverage',
    '**/dist',
    '**/browser',
    '**/docs',
    'tests/express-sample',
    'tests/express',
    'tests/browser',
    '**/bench',
    '**/src',
  ]),
]);
