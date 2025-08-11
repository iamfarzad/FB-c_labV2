import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/ai$': '<rootDir>/tests/mocks/ai.ts',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!isows|@supabase/.*|@google/genai/.*)',
  ],
  testPathIgnorePatterns: ['<rootDir>/playwright-tests/', '<rootDir>/tests/playwright/'],
}

export default createJestConfig(customJestConfig)
