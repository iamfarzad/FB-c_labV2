# Backend Compliance Tests

This directory contains comprehensive automated tests to validate compliance with the backend architecture rules defined in `backend_architecture.md`.

## Overview

The compliance test suite covers 12 major areas:

1. **Security** - Authentication, authorization, input validation, data protection
2. **Compliance** - GDPR, data privacy, audit logging
3. **Performance** - Response times, database queries, caching
4. **Scalability** - Load testing, auto-scaling, resource management
5. **Observability** - Monitoring, logging, alerting
6. **CI/CD** - Pipeline security, deployment, quality assurance
7. **Disaster Recovery** - Backup verification, restoration testing
8. **Testing** - Code coverage, unit tests, integration tests
9. **Network** - Security, connectivity, SSL/TLS
10. **Cost Management** - Resource monitoring, budget controls
11. **Ownership** - Code ownership, service ownership
12. **API Versioning** - Semantic versioning, backward compatibility

## Quick Start

### Prerequisites

1. Node.js 18+ and pnpm installed
2. Test environment configured (see `.env.test.example`)
3. Test database available

### Setup

```bash
# Install dependencies
pnpm install

# Copy test environment file
cp .env.test.example .env.test

# Update .env.test with your test configuration
```

### Running Tests

```bash
# Run all compliance tests
pnpm test:all

# Run specific test categories
pnpm test:security      # Security tests only
pnpm test:compliance    # Compliance tests only
pnpm test:performance   # Performance tests only
pnpm test:scalability   # Scalability tests only
pnpm test:observability # Observability tests only
pnpm test:ci           # CI/CD tests only
pnpm test:dr           # Disaster recovery tests only
pnpm test:network      # Network tests only
pnpm test:cost         # Cost management tests only
pnpm test:api          # API versioning tests only

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

### Using the Test Runner Script

```bash
# Make script executable (first time only)
chmod +x scripts/run-compliance-tests.sh

# Run comprehensive test suite with reporting
./scripts/run-compliance-tests.sh
```

## Test Structure

```
tests/
├── security/
│   ├── authentication.test.ts    # Auth & authorization tests
│   ├── api-security.test.ts      # API security tests
│   └── data-security.test.ts     # Data protection tests
├── compliance/
│   ├── gdpr.test.ts              # GDPR compliance tests
│   └── privacy.test.ts           # Data privacy tests
├── performance/
│   ├── response-time.test.ts     # API performance tests
│   └── caching.test.ts           # Caching tests
├── scalability/
│   ├── load-testing.test.ts      # Load testing
│   └── auto-scaling.test.ts      # Auto-scaling tests
├── observability/
│   ├── monitoring.test.ts        # Monitoring tests
│   └── logging.test.ts           # Logging tests
├── ci/
│   ├── pipeline.test.ts          # CI/CD pipeline tests
│   └── deployment.test.ts        # Deployment tests
├── disaster-recovery/
│   ├── backup.test.ts            # Backup tests
│   └── restoration.test.ts       # Restoration tests
├── network/
│   ├── security.test.ts          # Network security tests
│   └── connectivity.test.ts      # Connectivity tests
├── cost/
│   ├── monitoring.test.ts        # Cost monitoring tests
│   └── budget.test.ts            # Budget control tests
├── api/
│   ├── versioning.test.ts        # API versioning tests
│   └── compatibility.test.ts     # Backward compatibility tests
├── setup.ts                      # Test setup and utilities
└── README.md                     # This file
```

## Test Categories

### Security Tests (S1.1 - S3.4)

- **Authentication & Authorization**: JWT token validation, RBAC, session management
- **API Security**: Webhook signatures, CORS policies, request size limits
- **Data Security**: Encryption, SQL injection prevention, audit logging

### Compliance Tests (C1.1 - C3.4)

- **GDPR Compliance**: Data subject rights, consent management, data processing records
- **Data Privacy**: Data minimization, anonymization, access controls

### Performance Tests (P1.1 - P3.4)

- **Response Times**: API endpoint performance, database query optimization
- **Caching**: Cache hit rates, invalidation strategies
- **File Uploads**: Upload performance, size limits

### Scalability Tests (SC1.1 - SC3.4)

- **Load Testing**: Concurrent users, auto-scaling triggers
- **Resource Management**: Connection pooling, graceful degradation

### Observability Tests (O1.1 - O3.4)

- **Monitoring**: Health checks, metrics collection, alerting
- **Logging**: Structured logging, correlation IDs, log aggregation

## Configuration

### Environment Variables

Create a `.env.test` file with the following variables:

```env
# Test Server Configuration
TEST_BASE_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=test-secret-key-change-in-production

# Test Tokens
ADMIN_TOKEN=test-admin-token
USER_TOKEN=test-user-token

# Supabase Configuration (use test database)
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key

# AI Service Keys (use test keys)
GEMINI_API_KEY=your-test-gemini-key

# Email Service (use test keys)
RESEND_API_KEY=your-test-resend-key
RESEND_WEBHOOK_SECRET=your-test-webhook-secret
```

### Jest Configuration

The tests use Jest with TypeScript support. Configuration is in `jest.config.js`:

- Test environment: Node.js
- Coverage threshold: 80%
- Test timeout: 30 seconds
- TypeScript support enabled

## CI/CD Integration

### GitHub Actions

The `.github/workflows/compliance-tests.yml` file defines automated testing:

- Runs on push to main/develop branches
- Runs on pull requests
- Scheduled daily at 2 AM UTC
- Separate jobs for each test category
- Coverage reporting with Codecov
- Security scanning with npm audit

### Local Development

```bash
# Run tests before committing
pnpm test:all

# Check coverage
pnpm test:coverage

# Run security audit
pnpm audit --audit-level=high
```

## Test Utilities

### Global Test Utilities

The `tests/setup.ts` file provides global utilities:

```typescript
// Generate test tokens
const token = global.testUtils.generateTestToken('admin');

// Create test data
const lead = await global.testUtils.createTestLead(supabase);

// Clean up test data
await global.testUtils.cleanupTestData(supabase);
```

### Common Test Patterns

```typescript
// Test API endpoint
const response = await fetch(`${baseUrl}/api/endpoint`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(data)
});

expect(response.status).toBe(200);

// Test database query
const { data, error } = await supabase
  .from('table')
  .select('*')
  .limit(1);

expect(error).toBeNull();
expect(data).toBeDefined();

// Test performance
const startTime = Date.now();
await performOperation();
const endTime = Date.now();
const duration = endTime - startTime;

expect(duration).toBeLessThan(2000); // 2 seconds
```

## Reporting

### Test Reports

Tests generate detailed reports in `test-results/`:

- Individual test results for each category
- Coverage reports
- Security audit results
- Comprehensive compliance report

### Coverage Reports

Coverage reports are generated in `coverage/`:

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

### Compliance Report

The test runner generates a comprehensive markdown report:

- Test summary with pass/fail rates
- Detailed results for each category
- Security audit findings
- Recommendations for improvement

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure `.env.test` is properly configured
2. **Database Connection**: Verify test database is accessible
3. **API Keys**: Use test keys, not production keys
4. **Network Issues**: Check firewall and proxy settings

### Debug Mode

```bash
# Run tests with verbose output
pnpm test --verbose

# Run specific test with debugging
pnpm test --testNamePattern="S1.1_API_Authentication_Required"
```

### Test Data

- Tests create temporary data that is cleaned up automatically
- Use test-specific database to avoid affecting production data
- Test data is isolated and doesn't persist between test runs

## Contributing

### Adding New Tests

1. Create test file in appropriate category directory
2. Follow naming convention: `category-name.test.ts`
3. Use descriptive test names
4. Include proper setup and teardown
5. Add to appropriate test script in `package.json`

### Test Guidelines

- Tests should be independent and not rely on other tests
- Use descriptive test names that explain what is being tested
- Include proper error handling and cleanup
- Follow the existing patterns and conventions
- Ensure tests are fast and reliable

### Code Coverage

- Maintain 80% minimum code coverage
- Focus on critical business logic
- Test error conditions and edge cases
- Mock external dependencies appropriately

## Support

For issues with the compliance tests:

1. Check the test logs for detailed error messages
2. Verify environment configuration
3. Ensure all dependencies are installed
4. Check the backend architecture documentation
5. Review the test setup and utilities

## References

- [Backend Architecture Rules](backend_architecture.md)
- [Compliance Test Documentation](backend_compliance_tests.md)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Testing](https://jestjs.io/docs/getting-started#using-typescript)