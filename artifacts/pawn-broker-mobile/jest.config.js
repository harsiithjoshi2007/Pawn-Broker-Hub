/** @type {import('jest').Config} */
module.exports = {
  // Use babel-jest with the project's babel-preset-expo config.
  // We don't use the jest-expo preset because our tests are pure TS/JS
  // with no React Native rendering — it would pull in native setup files
  // that require a full mobile environment.
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Transform @tanstack/* and other ESM-only packages
  transformIgnorePatterns: [
    '/node_modules/(?!(@tanstack|@react-native-community|react-native)/).*',
  ],
};
