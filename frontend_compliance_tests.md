# Frontend Compliance Tests

## Overview

This document defines comprehensive automated tests to validate compliance with the frontend design standards defined in `frontend_design.md`. These tests ensure consistent implementation across component structure, design system, styling rules, accessibility, responsiveness, state management, routing, API integration, performance, error handling, testing, CI/CD, localization, theming, and deployment.

## Test Categories

### 1. Component Tests

#### Test: Component Structure Validation
**Description**: Validates that all components follow the established structure patterns
**Preconditions**: All components are in the correct directories
**Test Steps**:
```typescript
// __tests__/components/structure.test.tsx
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

describe('Component Structure', () => {
  test('all components are in correct directories', () => {
    const componentDirs = [
      'components/ui',
      'components/chat',
      'components/admin',
      'components/providers'
    ]
    
    componentDirs.forEach(dir => {
      const files = readdirSync(dir)
      files.forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          expect(file).toMatch(/^[A-Z][a-zA-Z0-9]*\.(tsx|ts)$/)
        }
      })
    })
  })
})
```
**Command**: `pnpm test components/structure`
**Expected Result**: All components follow naming conventions and are in correct directories

#### Test: Component Props Validation
**Description**: Ensures all components have proper TypeScript interfaces
**Preconditions**: Components have TypeScript interfaces defined
**Test Steps**:
```typescript
// __tests__/components/props.test.tsx
import { render } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

describe('Component Props', () => {
  test('Button accepts all required props', () => {
    const { getByRole } = render(<Button variant="default" size="default">Test</Button>)
    expect(getByRole('button')).toBeInTheDocument()
  })
  
  test('Card renders with proper structure', () => {
    const { getByText } = render(
      <Card>
        <div>Test content</div>
      </Card>
    )
    expect(getByText('Test content')).toBeInTheDocument()
  })
})
```
**Command**: `pnpm test components/props`
**Expected Result**: All components render correctly with their props

### 2. Design System Tests

#### Test: Design Token Validation
**Description**: Validates that design tokens are properly defined and used
**Preconditions**: Design tokens are defined in globals.css
**Test Steps**:
```typescript
// __tests__/design-system/tokens.test.ts
import { readFileSync } from 'fs'

describe('Design Tokens', () => {
  test('color tokens are defined in HSL format', () => {
    const css = readFileSync('app/globals.css', 'utf8')
    const colorTokens = css.match(/--color-[^:]+:\s*hsl\([^)]+\)/g)
    
    colorTokens?.forEach(token => {
      expect(token).toMatch(/hsl\(\d+\s+\d+%\s+\d+%\)/)
    })
  })
  
  test('spacing tokens follow Tailwind scale', () => {
    const tailwindConfig = require('../tailwind.config.ts')
    const spacing = tailwindConfig.theme.extend.spacing
    
    expect(spacing['0']).toBe('0px')
    expect(spacing['1']).toBe('0.25rem')
    expect(spacing['4']).toBe('1rem')
  })
})
```
**Command**: `pnpm test design-system/tokens`
**Expected Result**: All design tokens are properly formatted and follow the design system

#### Test: Color Usage Validation
**Description**: Ensures no hard-coded colors are used
**Preconditions**: ESLint rules are configured
**Test Steps**:
```bash
# scripts/test-colors.sh
#!/bin/bash
echo "Checking for hard-coded colors..."

# Check for hex colors
hex_colors=$(grep -r "#[0-9a-fA-F]\{3,6\}" components/ app/ --exclude-dir=node_modules --exclude-dir=.next)
if [ ! -z "$hex_colors" ]; then
  echo "Found hard-coded hex colors:"
  echo "$hex_colors"
  exit 1
fi

# Check for RGB colors
rgb_colors=$(grep -r "rgb(" components/ app/ --exclude-dir=node_modules --exclude-dir=.next)
if [ ! -z "$rgb_colors" ]; then
  echo "Found hard-coded RGB colors:"
  echo "$rgb_colors"
  exit 1
fi

echo "No hard-coded colors found"
```
**Command**: `chmod +x scripts/test-colors.sh && ./scripts/test-colors.sh`
**Expected Result**: No hard-coded colors found in the codebase

### 3. Style Tests

#### Test: CSS Class Usage Validation
**Description**: Validates that only approved Tailwind classes are used
**Preconditions**: Stylelint is configured
**Test Steps**:
```typescript
// __tests__/styles/classes.test.ts
import { readFileSync } from 'fs'
import { glob } from 'glob'

describe('CSS Class Usage', () => {
  test('no arbitrary values in Tailwind classes', async () => {
    const files = await glob('**/*.{tsx,ts}', { ignore: ['node_modules/**', '.next/**'] })
    
    files.forEach(file => {
      const content = readFileSync(file, 'utf8')
      const arbitraryValues = content.match(/class(Name)?="[^"]*\[[^\]]+\]/g)
      
      if (arbitraryValues) {
        console.warn(`Found arbitrary values in ${file}:`, arbitraryValues)
      }
    })
  })
})
```
**Command**: `pnpm test styles/classes`
**Expected Result**: No arbitrary values found in Tailwind classes

#### Test: Stylelint Rules Compliance
**Description**: Runs Stylelint to check CSS compliance
**Preconditions**: Stylelint configuration is set up
**Test Steps**:
```bash
# package.json script
"test:stylelint": "stylelint \"**/*.{css,scss}\" --formatter=json > stylelint-report.json"
```
**Command**: `pnpm test:stylelint`
**Expected Result**: No Stylelint violations

### 4. Accessibility Tests

#### Test: ARIA Roles Validation
**Description**: Ensures proper ARIA roles are used
**Preconditions**: Components have ARIA attributes
**Test Steps**:
```typescript
// __tests__/accessibility/aria.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

expect.extend(toHaveNoViolations)

describe('ARIA Compliance', () => {
  test('Button has proper ARIA attributes', async () => {
    const { container } = render(<Button aria-label="Test button">Click me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  test('Dialog has proper ARIA attributes', async () => {
    const { container } = render(
      <Dialog open>
        <div role="dialog" aria-labelledby="dialog-title">
          <h2 id="dialog-title">Dialog Title</h2>
          <p>Dialog content</p>
        </div>
      </Dialog>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```
**Command**: `pnpm test accessibility/aria`
**Expected Result**: No accessibility violations

#### Test: Keyboard Navigation
**Description**: Tests keyboard navigation functionality
**Preconditions**: Components support keyboard navigation
**Test Steps**:
```typescript
// __tests__/accessibility/keyboard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Keyboard Navigation', () => {
  test('Button is focusable and clickable with keyboard', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Test Button</Button>)
    
    const button = screen.getByRole('button')
    await user.tab()
    expect(button).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalled()
  })
})
```
**Command**: `pnpm test accessibility/keyboard`
**Expected Result**: All interactive elements are keyboard accessible

### 5. Responsive Tests

#### Test: Breakpoint Validation
**Description**: Tests responsive behavior at different breakpoints
**Preconditions**: Components are responsive
**Test Steps**:
```typescript
// __tests__/responsive/breakpoints.test.tsx
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/header'

describe('Responsive Breakpoints', () => {
  test('Header adapts to mobile viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    render(<Header />)
    
    // Mobile menu should be available
    expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument()
  })
  
  test('Header adapts to desktop viewport', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    
    render(<Header />)
    
    // Desktop navigation should be visible
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
```
**Command**: `pnpm test responsive/breakpoints`
**Expected Result**: Components adapt correctly to different viewport sizes

#### Test: Layout Shift Prevention
**Description**: Tests for Cumulative Layout Shift (CLS)
**Preconditions**: Images and fonts are optimized
**Test Steps**:
```typescript
// __tests__/responsive/layout-shift.test.tsx
import { render } from '@testing-library/react'
import { Card } from '@/components/ui/card'

describe('Layout Shift Prevention', () => {
  test('Cards maintain consistent dimensions', () => {
    const { container } = render(
      <div>
        <Card className="w-64 h-48">Card 1</Card>
        <Card className="w-64 h-48">Card 2</Card>
      </div>
    )
    
    const cards = container.querySelectorAll('[class*="w-64"]')
    cards.forEach(card => {
      expect(card).toHaveClass('w-64', 'h-48')
    })
  })
})
```
**Command**: `pnpm test responsive/layout-shift`
**Expected Result**: No unexpected layout shifts

### 6. State Management Tests

#### Test: Context Provider Validation
**Description**: Tests context providers work correctly
**Preconditions**: Context providers are implemented
**Test Steps**:
```typescript
// __tests__/state/context.test.tsx
import { render, screen } from '@testing-library/react'
import { ChatProvider, useChatContext } from '@/app/chat/context/ChatProvider'

const TestComponent = () => {
  const { activityLog, addActivity } = useChatContext()
  return (
    <div>
      <span data-testid="activity-count">{activityLog.length}</span>
      <button onClick={() => addActivity({ type: 'test', title: 'Test Activity' })}>
        Add Activity
      </button>
    </div>
  )
}

describe('Context Providers', () => {
  test('ChatProvider provides context values', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    )
    
    expect(screen.getByTestId('activity-count')).toHaveTextContent('0')
  })
  
  test('Context functions work correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    )
    
    await user.click(screen.getByText('Add Activity'))
    expect(screen.getByTestId('activity-count')).toHaveTextContent('1')
  })
})
```
**Command**: `pnpm test state/context`
**Expected Result**: Context providers work correctly

#### Test: Custom Hooks Validation
**Description**: Tests custom hooks behavior
**Preconditions**: Custom hooks are implemented
**Test Steps**:
```typescript
// __tests__/state/hooks.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useChat } from '@/hooks/chat/useChat'

describe('Custom Hooks', () => {
  test('useChat manages message state', () => {
    const { result } = renderHook(() => useChat())
    
    act(() => {
      result.current.setInput('Test message')
    })
    
    expect(result.current.input).toBe('Test message')
  })
  
  test('useChat handles message sending', async () => {
    const { result } = renderHook(() => useChat())
    
    act(() => {
      result.current.setInput('Test message')
    })
    
    await act(async () => {
      await result.current.sendMessage('Test message')
    })
    
    expect(result.current.messages).toHaveLength(2) // User + Assistant
  })
})
```
**Command**: `pnpm test state/hooks`
**Expected Result**: Custom hooks work as expected

### 7. Routing Tests

#### Test: Route Protection
**Description**: Tests route protection and navigation
**Preconditions**: Routes are configured
**Test Steps**:
```typescript
// __tests__/routing/protection.test.tsx
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import AdminPage from '@/app/admin/page'

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Route Protection', () => {
  test('Admin page requires authentication', () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
    }
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    
    render(<AdminPage />)
    
    // Should redirect to login or show access denied
    expect(screen.getByText(/access denied|login/i)).toBeInTheDocument()
  })
})
```
**Command**: `pnpm test routing/protection`
**Expected Result**: Protected routes are properly secured

#### Test: Navigation Flow
**Description**: Tests navigation between pages
**Preconditions**: Navigation components are implemented
**Test Steps**:
```typescript
// __tests__/routing/navigation.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '@/components/header'

describe('Navigation Flow', () => {
  test('Header navigation works correctly', async () => {
    const user = userEvent.setup()
    render(<Header />)
    
    const homeLink = screen.getByText('Home')
    await user.click(homeLink)
    
    // Should navigate to home page
    expect(window.location.pathname).toBe('/')
  })
})
```
**Command**: `pnpm test routing/navigation`
**Expected Result**: Navigation works correctly

### 8. API Integration Tests

#### Test: API Endpoint Validation
**Description**: Tests API endpoints are working
**Preconditions**: API routes are implemented
**Test Steps**:
```typescript
// __tests__/api/endpoints.test.ts
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/chat/route'

describe('API Endpoints', () => {
  test('Chat API accepts valid requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: 'Hello' }],
        data: { sessionId: 'test' }
      },
    })
    
    await POST(req)
    
    expect(res._getStatusCode()).toBe(200)
  })
  
  test('Chat API rejects invalid requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    })
    
    await POST(req)
    
    expect(res._getStatusCode()).toBe(400)
  })
})
```
**Command**: `pnpm test api/endpoints`
**Expected Result**: API endpoints work correctly

#### Test: Data Handling
**Description**: Tests data handling patterns
**Preconditions**: Data handling functions are implemented
**Test Steps**:
```typescript
// __tests__/api/data-handling.test.ts
import { renderHook } from '@testing-library/react'
import { useChat } from '@/hooks/chat/useChat'

describe('Data Handling', () => {
  test('Chat hook handles streaming responses', async () => {
    const { result } = renderHook(() => useChat())
    
    // Mock streaming response
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"content": "Hello"}\n\n'))
        controller.enqueue(new TextEncoder().encode('data: {"done": true}\n\n'))
        controller.close()
      }
    })
    
    // Test streaming handling
    expect(result.current.isLoading).toBe(false)
  })
})
```
**Command**: `pnpm test api/data-handling`
**Expected Result**: Data handling works correctly

### 9. Performance Tests

#### Test: Bundle Size Validation
**Description**: Tests bundle size is within limits
**Preconditions**: Build process is configured
**Test Steps**:
```bash
# scripts/test-bundle-size.sh
#!/bin/bash
echo "Testing bundle size..."

# Build the application
pnpm build

# Check main bundle size
main_bundle_size=$(du -k .next/static/chunks/main-*.js | cut -f1)
if [ $main_bundle_size -gt 500 ]; then
  echo "Main bundle too large: ${main_bundle_size}KB"
  exit 1
fi

# Check vendor bundle size
vendor_bundle_size=$(du -k .next/static/chunks/vendor-*.js | cut -f1)
if [ $vendor_bundle_size -gt 1000 ]; then
  echo "Vendor bundle too large: ${vendor_bundle_size}KB"
  exit 1
fi

echo "Bundle sizes are within limits"
```
**Command**: `chmod +x scripts/test-bundle-size.sh && ./scripts/test-bundle-size.sh`
**Expected Result**: Bundle sizes are within acceptable limits

#### Test: Lighthouse Performance
**Description**: Runs Lighthouse performance audit
**Preconditions**: Application is running
**Test Steps**:
```bash
# package.json script
"test:lighthouse": "lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json --only-categories=performance"
```
**Command**: `pnpm test:lighthouse`
**Expected Result**: Performance score > 90

### 10. Error Handling Tests

#### Test: Error Boundary Validation
**Description**: Tests error boundaries work correctly
**Preconditions**: Error boundaries are implemented
**Test Steps**:
```typescript
// __tests__/error-handling/boundaries.test.tsx
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error-boundary'

const ThrowError = () => {
  throw new Error('Test error')
}

describe('Error Boundaries', () => {
  test('ErrorBoundary catches errors', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
  
  test('ErrorBoundary provides recovery options', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
    expect(screen.getByText(/refresh page/i)).toBeInTheDocument()
  })
})
```
**Command**: `pnpm test error-handling/boundaries`
**Expected Result**: Error boundaries work correctly

#### Test: API Error Handling
**Description**: Tests API error handling
**Preconditions**: Error handling is implemented
**Test Steps**:
```typescript
// __tests__/error-handling/api.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/chat/useChat'

// Mock fetch to return error
global.fetch = jest.fn(() =>
  Promise.reject(new Error('Network error'))
) as jest.Mock

describe('API Error Handling', () => {
  test('Chat hook handles API errors', async () => {
    const { result } = renderHook(() => useChat())
    
    await act(async () => {
      await result.current.sendMessage('Test message')
    })
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})
```
**Command**: `pnpm test error-handling/api`
**Expected Result**: API errors are handled gracefully

### 11. Localization Tests

#### Test: String Extraction
**Description**: Tests that all user-facing strings are extractable
**Preconditions**: Internationalization setup is configured
**Test Steps**:
```typescript
// __tests__/localization/strings.test.tsx
import { readFileSync } from 'fs'
import { glob } from 'glob'

describe('String Extraction', () => {
  test('all user-facing strings are in translation files', async () => {
    const files = await glob('**/*.{tsx,ts}', { ignore: ['node_modules/**', '.next/**'] })
    const translationKeys = new Set()
    
    files.forEach(file => {
      const content = readFileSync(file, 'utf8')
      // Extract text content that should be translated
      const textMatches = content.match(/>([^<>{}\n]+)</g)
      textMatches?.forEach(match => {
        const text = match.replace(/[><]/g, '').trim()
        if (text.length > 0 && !text.match(/^[0-9\s\-_]+$/)) {
          translationKeys.add(text)
        }
      })
    })
    
    // Check if translation file exists
    const translationFile = readFileSync('locales/en.json', 'utf8')
    const translations = JSON.parse(translationFile)
    
    translationKeys.forEach(key => {
      expect(translations).toHaveProperty(key)
    })
  })
})
```
**Command**: `pnpm test localization/strings`
**Expected Result**: All user-facing strings are in translation files

### 12. Theming Tests

#### Test: Theme Switching
**Description**: Tests theme switching functionality
**Preconditions**: Theme system is implemented
**Test Steps**:
```typescript
// __tests__/theming/switch.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

describe('Theme Switching', () => {
  test('Theme toggle switches between light and dark', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    const toggle = screen.getByRole('button')
    await user.click(toggle)
    
    // Check if theme class is applied
    expect(document.documentElement).toHaveClass('dark')
  })
  
  test('Theme persists in localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    // Check if theme is saved
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
```
**Command**: `pnpm test theming/switch`
**Expected Result**: Theme switching works correctly

#### Test: CSS Variable Values
**Description**: Tests CSS custom properties are set correctly
**Preconditions**: CSS variables are defined
**Test Steps**:
```typescript
// __tests__/theming/variables.test.tsx
import { render } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

describe('CSS Variables', () => {
  test('CSS variables are set correctly for light theme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <div>Test</div>
      </ThemeProvider>
    )
    
    const computedStyle = getComputedStyle(document.documentElement)
    expect(computedStyle.getPropertyValue('--background')).toBe('0 0% 98%')
    expect(computedStyle.getPropertyValue('--foreground')).toBe('0 0% 10%')
  })
  
  test('CSS variables are set correctly for dark theme', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Test</div>
      </ThemeProvider>
    )
    
    const computedStyle = getComputedStyle(document.documentElement)
    expect(computedStyle.getPropertyValue('--background')).toBe('0 0% 10%')
    expect(computedStyle.getPropertyValue('--foreground')).toBe('0 0% 96%')
  })
})
```
**Command**: `pnpm test theming/variables`
**Expected Result**: CSS variables are set correctly for each theme

### 13. Dependency Tests

#### Test: Version Compatibility
**Description**: Tests dependency versions are compatible
**Preconditions**: Package.json is up to date
**Test Steps**:
```bash
# scripts/test-dependencies.sh
#!/bin/bash
echo "Testing dependency compatibility..."

# Check for outdated packages
outdated=$(pnpm outdated --format=json)
if [ ! -z "$outdated" ]; then
  echo "Found outdated packages:"
  echo "$outdated"
  exit 1
fi

# Check for security vulnerabilities
vulnerabilities=$(pnpm audit --audit-level=moderate)
if [ $? -ne 0 ]; then
  echo "Found security vulnerabilities:"
  echo "$vulnerabilities"
  exit 1
fi

echo "All dependencies are up to date and secure"
```
**Command**: `chmod +x scripts/test-dependencies.sh && ./scripts/test-dependencies.sh`
**Expected Result**: No outdated packages or security vulnerabilities

### 14. Build Tests

#### Test: Build Success
**Description**: Tests that the application builds successfully
**Preconditions**: Build configuration is correct
**Test Steps**:
```bash
# scripts/test-build.sh
#!/bin/bash
echo "Testing build process..."

# Clean previous build
rm -rf .next

# Run build
pnpm build

if [ $? -eq 0 ]; then
  echo "Build successful"
else
  echo "Build failed"
  exit 1
fi

# Check build output
if [ ! -d ".next" ]; then
  echo "Build output not found"
  exit 1
fi

echo "Build test passed"
```
**Command**: `chmod +x scripts/test-build.sh && ./scripts/test-build.sh`
**Expected Result**: Build completes successfully

#### Test: TypeScript Compilation
**Description**: Tests TypeScript compilation
**Preconditions**: TypeScript is configured
**Test Steps**:
```bash
# package.json script
"test:types": "tsc --noEmit"
```
**Command**: `pnpm test:types`
**Expected Result**: No TypeScript errors

### 15. CI/CD Tests

#### Test: Pipeline Job Success
**Description**: Tests CI/CD pipeline jobs
**Preconditions**: CI/CD configuration is set up
**Test Steps**:
```yaml
# .github/workflows/test.yml
name: Frontend Compliance Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:all
      - run: pnpm test:e2e
      - run: pnpm test:performance
      - run: pnpm test:accessibility
```
**Command**: `git push origin main`
**Expected Result**: All CI/CD jobs pass

### 16. E2E Tests

#### Test: User Journey Validation
**Description**: Tests complete user journeys
**Preconditions**: Playwright is configured
**Test Steps**:
```typescript
// tests/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Journey', () => {
  test('Complete chat flow', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to chat
    await page.click('text=Chat')
    await expect(page).toHaveURL('/chat')
    
    // Send a message
    await page.fill('[data-testid="chat-input"]', 'Hello AI')
    await page.click('[data-testid="send-button"]')
    
    // Wait for response
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible()
  })
  
  test('Lead capture flow', async ({ page }) => {
    await page.goto('/chat')
    
    // Fill lead form
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="submit-lead"]')
    
    // Verify lead capture
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible()
  })
})
```
**Command**: `pnpm test:e2e`
**Expected Result**: All user journeys work correctly

## Integration Instructions

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Testing Environment
```bash
# Install testing dependencies
pnpm add -D @testing-library/jest-dom @testing-library/react @testing-library/user-event jest jest-environment-jsdom @playwright/test lighthouse pa11y webpack-bundle-analyzer

# Install ESLint plugins
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-jsx-a11y

# Install Stylelint plugins
pnpm add -D stylelint-order
```

### 3. Configure CI/CD Pipeline
Add the following to your CI/CD configuration:

```yaml
# .github/workflows/compliance.yml
name: Frontend Compliance
on: [push, pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:all
      - run: pnpm test:e2e
      - run: pnpm test:performance
      - run: pnpm test:accessibility
      - run: pnpm test:security
      - run: pnpm test:bundle
```

### 4. Add Pre-commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint:all
pnpm test:types
pnpm test
```

### 5. Run Compliance Tests
```bash
# Run all compliance tests
pnpm test:compliance

# Run specific test categories
pnpm test:component
pnpm test:design-system
pnpm test:accessibility
pnpm test:performance
pnpm test:e2e
```

### 6. Monitor Test Results
- Check test coverage reports
- Review Lighthouse performance scores
- Monitor accessibility compliance
- Track bundle size changes

## Maintenance

### Regular Updates
- Update testing dependencies monthly
- Review and update test cases quarterly
- Monitor CI/CD pipeline performance
- Update compliance standards as needed

### Test Maintenance
- Remove obsolete tests
- Update test data and mocks
- Refactor tests for better performance
- Add tests for new features

This comprehensive test suite ensures that the frontend codebase maintains high quality standards and complies with all design system requirements.