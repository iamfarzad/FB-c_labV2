import { defineConfig, devices } from '@playwright/test';

// Use a different port range to avoid conflicts
const TEST_PORT = 4000;
const TEST_URL = `http://localhost:${TEST_PORT}`;

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: false, // Disable parallel execution
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Use only one worker
  reporter: 'html',
  use: {
    baseURL: TEST_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false, // Show the browser for debugging
  },
  // Only use Chromium for testing
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  // Disable the built-in web server since we're having conflicts
  // We'll start the server manually before running tests
  webServer: undefined,
  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,
});
