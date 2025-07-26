# Chat UI Testing Suite

This comprehensive testing suite covers all aspects of the chat functionality with three main layers of testing.

## 🧪 Test Structure

### 1. **E2E Testing (Full-Flow Testing)**
**Location:** `tests/playwright/`
**Tool:** Playwright
**Purpose:** Test complete user workflows

#### Tests Include:
- ✅ Page loads correctly
- ✅ Input bar visible and functional  
- ✅ Typing and sending messages works
- ✅ Voice/mic buttons visible and clickable
- ✅ Attachment menu opens
- ✅ Message display and conversation flow
- ✅ Responsive design across devices
- ✅ Keyboard shortcuts
- ✅ Error handling and edge cases

#### Run E2E Tests:
```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI (interactive mode)
pnpm test:e2e:ui

# Run specific test file
npx playwright test tests/playwright/chat.spec.ts

# Run visual regression tests
npx playwright test tests/playwright/chat-visual.spec.ts
```

### 2. **Component Tests (Unit + UI Logic)**
**Location:** `tests/components/`
**Tool:** @testing-library/react + Jest
**Purpose:** Test individual components in isolation

#### Tests Include:
- ✅ ChatInput component functionality
- ✅ ChatMain message display
- ✅ Input validation and handling
- ✅ Event handling (typing, submitting)
- ✅ Component state management
- ✅ Props handling and edge cases

#### Run Component Tests:
```bash
# Run all unit tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test ChatInput.test.tsx
```

### 3. **Visual Snapshot Tests**
**Location:** `tests/playwright/chat-visual.spec.ts`
**Tool:** Playwright Visual Comparisons
**Purpose:** Detect UI breakage and visual regressions

#### Screenshots Include:
- ✅ Empty chat state
- ✅ Chat with messages
- ✅ Mobile/tablet responsive views
- ✅ Input states (empty, filled, loading)
- ✅ Dark mode (if available)
- ✅ Attachment menus
- ✅ Cross-browser comparisons

#### Run Visual Tests:
```bash
# Run visual tests
npx playwright test tests/playwright/chat-visual.spec.ts

# Update snapshots when UI changes
npx playwright test tests/playwright/chat-visual.spec.ts --update-snapshots
```

### 4. **API Route Testing**
**Location:** `tests/api/`
**Tool:** Jest
**Purpose:** Test backend chat API endpoints

#### Tests Include:
- ✅ Valid message handling
- ✅ Request/response format validation
- ✅ Error handling (malformed requests, rate limits)
- ✅ Security (input sanitization, auth)
- ✅ Edge cases (large messages, concurrent requests)

#### Run API Tests:
```bash
# Run API tests specifically
pnpm test api/

# Or include in general test run
pnpm test
```

## 🚀 Quick Start

### Setup (One Time)
```bash
# Install dependencies (if not already done)
pnpm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests
```bash
# Run unit/component tests
pnpm test

# Run E2E tests  
pnpm test:e2e

# Run everything with coverage
pnpm test:coverage && pnpm test:e2e
```

## 📊 Test Coverage

The test suite aims for:
- **80%+ Code Coverage** on components and utilities
- **100% Critical Path Coverage** for chat functionality
- **Cross-browser Testing** (Chrome, Firefox, Safari)
- **Responsive Testing** (Mobile, Tablet, Desktop)

## 🐛 Debugging Tests

### Failed E2E Tests
```bash
# Run with debug mode
npx playwright test --debug

# Run headed (see browser)
npx playwright test --headed

# Generate trace for failed tests
npx playwright test --trace on
```

### Failed Unit Tests
```bash
# Run with verbose output
pnpm test --verbose

# Run specific test with debugging
pnpm test --testNamePattern="specific test name"
```

### Visual Test Failures
```bash
# View visual diff report
npx playwright show-report

# Update snapshots after UI changes
npx playwright test --update-snapshots
```

## 📁 File Structure

```
tests/
├── README.md                     # This file
├── setup.ts                      # Jest setup
├── playwright/                   # E2E tests
│   ├── chat.spec.ts             # Main chat functionality
│   ├── chat-visual.spec.ts      # Visual regression
│   └── chat-layout.spec.ts      # Existing layout tests
├── components/                   # Component unit tests
│   ├── ChatInput.test.tsx       # Input component tests
│   └── ChatMain.test.tsx        # Main chat component tests
└── api/                         # API endpoint tests
    └── chat-api.test.ts         # Chat API tests
```

## 🔧 Configuration Files

- **`jest.config.cjs`** - Jest configuration for unit tests
- **`playwright.config.ts`** - Playwright configuration for E2E tests
- **`tests/setup.ts`** - Test environment setup

## 💡 Best Practices

### Writing Tests
1. **Use descriptive test names** that explain what's being tested
2. **Test user behavior, not implementation details**
3. **Include both happy path and edge cases**
4. **Mock external dependencies appropriately**
5. **Keep tests independent and idempotent**

### Test Data
```typescript
// Good: Use realistic test data
const testMessage = {
  id: '1',
  role: 'user',
  content: 'Hello, how can you help me?',
  timestamp: new Date()
}

// Bad: Use minimal/unrealistic data
const testMessage = { content: 'hi' }
```

### Selectors
```typescript
// Good: Use semantic selectors
page.getByPlaceholder('Ask anything...')
page.getByRole('button', { name: 'Send message' })

// Okay: Use data-testid for complex elements
page.getByTestId('chat-layout')

// Avoid: Brittle CSS selectors
page.locator('.css-class-123')
```

## 🚨 Common Issues

### Port Conflicts
If tests fail due to port conflicts, check:
- Next.js dev server is running on port 3001
- No other services using the same port
- Update `playwright.config.ts` if using different port

### Flaky Tests
If tests are inconsistent:
- Add appropriate `waitFor` statements
- Increase timeouts for slow operations
- Check for race conditions in async operations

### Visual Test Changes
When UI changes cause visual test failures:
1. Review the changes in the HTML report
2. If changes are intentional, update snapshots
3. If unintentional, fix the UI regression

## 📈 Continuous Integration

Tests are configured to run in CI with:
- **Parallel execution** for faster results
- **Retry logic** for flaky tests
- **Artifact collection** (screenshots, videos, traces)
- **Coverage reporting**

## 🎯 Testing Checklist

Before deploying chat functionality:

- [ ] All unit tests pass
- [ ] All E2E tests pass  
- [ ] Visual regression tests pass
- [ ] API tests pass
- [ ] Tests run successfully in CI
- [ ] Coverage meets minimum thresholds
- [ ] Manual testing on different devices
- [ ] Performance testing (if applicable)

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)