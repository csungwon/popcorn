// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const pluginQuery = require('@tanstack/eslint-plugin-query')

module.exports = defineConfig([
  ...pluginQuery.default.configs['flat/recommended'],
  expoConfig,
  {
    ignores: ['dist/*']
  }
])
