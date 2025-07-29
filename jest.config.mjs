import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!isows|@supabase/.*)',
  ],
  testPathIgnorePatterns: ['<rootDir>/playwright-tests/'],
}

export default createJestConfig(customJestConfig)
