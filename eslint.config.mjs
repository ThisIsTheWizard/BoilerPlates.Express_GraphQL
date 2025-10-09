import babelParser from '@babel/eslint-parser'
import eslintJS from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  eslintJS.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      parser: babelParser,
      parserOptions: {
        babelOptions: {
          babelrc: false,
          configFile: false,
          presets: ['@babel/preset-env']
        },
        ecmaVersion: 'latest',
        requireConfigFile: false,
        sourceType: 'module'
      },
      sourceType: 'module'
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin
    },
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'import/extensions': ['error', 'never'],
      'import/named': 'error',
      'import/no-relative-packages': 'error',
      'import/no-unresolved': ['error', { commonjs: false, amd: false }],
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'no-prototype-builtins': 'off',
      'no-undef': 'error',
      'no-underscore-dangle': 'off',
      'no-unneeded-ternary': 'off',
      'no-unused-vars': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', { const: 'never' }],
      'prefer-const': 'error',
      'prettier/prettier': ['error'],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      'max-params': ['error', 3]
    },
    settings: {
      'import/resolver': {
        'babel-module': {
          alias: {
            src: './src' // Match the alias as per Babel config
          }
        },
        node: {
          extensions: ['.js'] // Resolve .js files in node_modules
        }
      }
    }
  }
]
