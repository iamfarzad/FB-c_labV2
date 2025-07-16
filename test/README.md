# Backend Compliance Tests

This directory contains comprehensive automated tests to validate compliance with the architectural requirements defined in `backend_architecture.md`.

## Test Categories

### 1. Security Tests (`test/security/`)
- **Authentication Validation**: Verify all protected endpoints require proper authentication
- **Input Validation**: Test Zod schema validation for all API endpoints
- **Webhook Verification**: Validate HMAC signature verification
- **Rate Limiting**: Test rate limiting enforcement
- **SQL Injection Prevention**: Test input sanitization
- **XSS Prevention**: Test output encoding

### 2. Compliance Tests (`test/compliance/`)
- **GDPR Data Handling**: Test data deletion, export, and consent management
- **Audit Logging**: Verify comprehensive audit logging for all operations
- **Data Retention**: Test data retention policies
- **Consent Management**: Test consent tracking and withdrawal

### 3. Performance Tests (`test/performance/`)
- **API Response Time**: Verify endpoints meet performance targets
- **Database Query Performance**: Test database query optimization
- **Concurrent Request Handling**: Test system under load
- **Memory Usage**: Monitor memory consumption

### 4. Scalability Tests (`test/scalability/`)
- **Auto-scaling Validation**: Test auto-scaling behavior under load
- **Burst Traffic Handling**: Test system response to traffic spikes
- **Resource Utilization**: Monitor resource usage patterns

### 5. Observability Tests (`test/observability/`)
- **Logging Validation**: Verify comprehensive logging implementation
- **Metrics Collection**: Test metrics collection and reporting
- **Error Tracking**: Test error detection and alerting
- **Tracing**: Test distributed tracing implementation

### 6. CI/CD Tests (`test/cicd/`)
- **Pipeline Validation**: Test CI/CD pipeline stages
- **Deployment Verification**: Test deployment process and health checks
- **Rollback Procedures**: Test rollback mechanisms

### 7. Disaster Recovery Tests (`test/disaster-recovery/`)
- **Backup Integrity**: Verify backup procedures and data integrity
- **Failover Procedures**: Test failover mechanisms
- **Data Recovery**: Test data restoration procedures

### 8. API Version Tests (`test/api-versioning/`)
- **Version Header Validation**: Test API versioning implementation
- **Deprecation Handling**: Test deprecation warnings
- **Backward Compatibility**: Test backward compatibility

### 9. Network Tests (`test/network/`)
- **Service Reachability**: Test service connectivity
- **CORS Configuration**: Test CORS policies
- **Security Headers**: Test security header implementation

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up test environment variables in `.env.test`:
```bash
# Test Environment Variables
TEST_BASE_URL=http://localhost:3000
TEST_AUTH_TOKEN=test-token
ADMIN_TOKEN=admin-test-token
LOG_API_URL=http://localhost:8080
LOG_API_KEY=test-log-key
METRICS_API_URL=http://localhost:8081
METRICS_API_KEY=test-metrics-key
WEBSOCKET_URL=ws://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

### Running All Tests

```bash
# Run all tests
npm run test:all

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test
```

### Running Specific Test Categories

```bash
# Security tests
npm run test:security

# Compliance tests
npm run test:compliance

# Performance tests
npm run test:performance

# Scalability tests
npm run test:scalability

# Observability tests
npm run test:observability

# CI/CD tests
npm run test:cicd

# Disaster recovery tests
npm run test:disaster-recovery

# API versioning tests
npm run test:api-versioning

# Network tests
npm run test:network
```

### Running Individual Test Files

```bash
# Run specific test file
npm run test test/security/input-validation.test.ts

# Run tests matching pattern
npm run test -- --grep "authentication"
```

### Test UI

```bash
# Open test UI for interactive testing
npm run test:ui
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

The test configuration includes:
- Node.js environment
- Path aliases for imports
- Coverage thresholds (80% minimum)
- Test timeouts and globals
- File inclusion/exclusion patterns

### Test Setup (`test/setup.ts`)

The setup file configures:
- Test environment variables
- Global test utilities
- Test constants
- Mock data generators

### Test Utilities

Common test utilities available in `test/setup.ts`:

```typescript
import { testUtils, TEST_CONSTANTS } from '../setup'

// Generate test data
const testLead = testUtils.generateTestLead()
const testMessage = testUtils.generateTestChatMessage()

// Wait for operations
await testUtils.wait(1000)

// Generate random data
const randomEmail = testUtils.randomEmail()
const randomString = testUtils.randomString(10)
```

## Writing New Tests

### Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { testUtils } from '../setup'

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup test data
  })

  afterAll(async () => {
    // Cleanup test data
  })

  it('should perform expected behavior', async () => {
    // Test implementation
    expect(result).toBe(expected)
  })
})
```

### Best Practices

1. **Use descriptive test names**: Test names should clearly describe what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Use test utilities**: Leverage the provided test utilities for consistent test data
4. **Clean up after tests**: Always clean up test data to avoid interference
5. **Test both positive and negative cases**: Test both valid and invalid inputs
6. **Use appropriate timeouts**: Set appropriate timeouts for async operations
7. **Mock external dependencies**: Mock external services to avoid flaky tests

### Example Test

```typescript
import { describe, it, expect } from 'vitest'
import { validateInput, LeadCaptureSchema } from '@/lib/validation-schemas'
import { testUtils } from '../setup'

describe('Lead Capture Validation', () => {
  it('should validate correct lead data', () => {
    const validData = testUtils.generateTestLead()
    expect(() => validateInput(LeadCaptureSchema, validData)).not.toThrow()
  })

  it('should reject invalid email format', () => {
    const invalidData = {
      ...testUtils.generateTestLead(),
      email: 'invalid-email'
    }
    expect(() => validateInput(LeadCaptureSchema, invalidData)).toThrow('Invalid email format')
  })
})
```

## Continuous Integration

### GitHub Actions

The tests are integrated into the CI/CD pipeline via GitHub Actions:

```yaml
name: Compliance Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run security tests
      run: npm run test:security
    
    - name: Run compliance tests
      run: npm run test:compliance
    
    - name: Run all tests
      run: npm run test:all
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### Pre-commit Hooks

Tests are automatically run before commits:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:security
npm run test:compliance
```

## Coverage Requirements

The test suite enforces minimum coverage thresholds:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Troubleshooting

### Common Issues

1. **Test timeout**: Increase timeout in `vitest.config.ts` or use `testUtils.wait()`
2. **Environment variables**: Ensure all required environment variables are set in `.env.test`
3. **Database connection**: Ensure the test database is accessible
4. **External services**: Mock external services to avoid dependency issues

### Debug Mode

Run tests in debug mode for more verbose output:

```bash
npm run test -- --reporter=verbose
```

### Test Isolation

Each test should be isolated and not depend on other tests. Use `beforeEach` and `afterEach` hooks for setup and cleanup:

```typescript
describe('Feature', () => {
  beforeEach(async () => {
    // Setup for each test
  })

  afterEach(async () => {
    // Cleanup after each test
  })
})
```

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Add appropriate test categories
3. Update this README if adding new test utilities or patterns
4. Ensure tests pass in CI/CD pipeline
5. Maintain test coverage above 80%

## Support

For questions about the test framework or help writing tests, refer to:
- [Vitest Documentation](https://vitest.dev/)
- [Backend Architecture Documentation](../backend_architecture.md)
- [Compliance Test Documentation](../backend_compliance_tests.md)