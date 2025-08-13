module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/lib/ai$': '<rootDir>/__mocks__/lib/ai.ts',
    '^@/(.*)$': '<rootDir>/$1',
    '^industry-ai-education\\./(.*)$': '<rootDir>/__mocks__/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json', isolatedModules: true }],
  },
  transformIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: ['<rootDir>/industry-ai-education\\./'],
  testPathIgnorePatterns: [
    '<rootDir>/playwright-tests/',
    '<rootDir>/tests/playwright/',
    '<rootDir>/tests/api/session-headers.spec.ts',
    '<rootDir>/tests/components/',
    '<rootDir>/tests/app/',
    '<rootDir>/tests/security/',
    '<rootDir>/tests/performance/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/__tests__/components/',
    '<rootDir>/archive/',
  ],
}


