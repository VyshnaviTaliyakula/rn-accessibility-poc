import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo/web',
  testMatch: ['<rootDir>/tests/web/**/*.test.jsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/web/setup.js'],
};

export default config;
