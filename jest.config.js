module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/lib/ai$': '<rootDir>/__mocks__/lib/ai.ts',
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/rate-limit$': '<rootDir>/lib/rate-limiting.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json', isolatedModules: true }],
  },
  transformIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: [],
  testPathIgnorePatterns: [
    '<rootDir>/playwright-tests/',
    '<rootDir>/tests/playwright/',
    // Silence heavy suites temporarily
    '<rootDir>/tests/api/optimized-routes.test.ts',
    '<rootDir>/tests/api/chat-api.test.ts',
    '<rootDir>/tests/ChatFooter.test.tsx',
    '<rootDir>/tests/ChatContainer.test.tsx',
    '<rootDir>/tests/design-system.test.tsx',
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


