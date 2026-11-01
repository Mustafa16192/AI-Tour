const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'coverage/*', 'node_modules/*']),
  expoConfig,
  {
    files: ['babel.config.js', 'eslint.config.js', 'jest.config.js', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['__tests__/**/*.js'],
    languageOptions: { globals: globals.jest },
  },
]);
