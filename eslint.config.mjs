import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...globals.jest
      },
      sourceType: 'module'
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin
    },
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'import/extensions': 'off',
      'import/named': 'error',
      'import/no-relative-packages': 'error',
      'no-prototype-builtins': 'off',
      'no-underscore-dangle': 'off',
      'no-unneeded-ternary': 'off',
      'no-unused-vars': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', { const: 'never' }],
      'prefer-const': 'error',
      'prettier/prettier': ['error'],
      'max-params': ['error', 4]
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js'] }
      }
    }
  },
  { ignores: ['dist', 'build', 'test/**/*.js'] }
]
