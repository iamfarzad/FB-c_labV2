# Backend Compliance Tests

## Test Overview

This document contains automated tests to validate compliance with the backend architecture rules. Each test category corresponds to a specific rule set and includes unit tests, integration tests, and end-to-end validation scripts.

## 1. Security Tests

### 1.1 Authentication & Authorization Tests

#### Test: S1.1_API_Authentication_Required
**Description**: Verify all API endpoints require proper authentication
**Preconditions**: Server running, test database configured
**Test Steps**:
\`\`\`typescript
// Test each protected endpoint
const protectedEndpoints = [
  '/api/admin/leads',
  '/api/admin/ai-performance',
  '/api/admin/analytics',
  '/api/admin/email-campaigns',
  '/api/admin/export',
  '/api/admin/real-time-activity',
  '/api/admin/stats',
  '/api/admin/token-usage'
];

for (const endpoint of protectedEndpoints) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  assert(response.status === 401, `Endpoint ${endpoint} should require authentication`);
}
\`\`\`
**Commands**: `pnpm test:security:auth`
**Expected Result**: All protected endpoints return 401 Unauthorized

#### Test: S1.2_JWT_Token_Expiration
**Description**: Verify JWT tokens expire within 24 hours
**Preconditions**: Authentication system configured
**Test Steps**:
\`\`\`typescript
// Generate token and verify expiration
const token = await generateJWT({ userId: 'test', role: 'user' });
const decoded = jwt.decode(token) as any;
const expirationTime = new Date(decoded.exp * 1000);
const now = new Date();
const maxExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);

assert(expirationTime <= maxExpiration, 'JWT token should expire within 24 hours');
\`\`\`
**Commands**: `pnpm test:security:jwt`
**Expected Result**: All JWT tokens expire within 24 hours

#### Test: S1.3_RBAC_Admin_Access
**Description**: Verify role-based access control for admin endpoints
**Preconditions**: RBAC system configured with test users
**Test Steps**:
\`\`\`typescript
// Test admin access with different roles
const testCases = [
  { role: 'user', shouldAccess: false },
  { role: 'admin', shouldAccess: true },
  { role: 'service_role', shouldAccess: true }
];

for (const testCase of testCases) {
  const token = await generateJWT({ userId: 'test', role: testCase.role });
  const response = await fetch(`${baseUrl}/api/admin/leads`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  assert(
    (response.status === 200) === testCase.shouldAccess,
    `Role ${testCase.role} should ${testCase.shouldAccess ? 'have' : 'not have'} admin access`
  );
}
\`\`\`
**Commands**: `pnpm test:security:rbac`
**Expected Result**: Only admin and service_role users can access admin endpoints

#### Test: S1.4_Input_Validation
**Description**: Verify all user inputs are validated and sanitized
**Preconditions**: Input validation middleware configured
**Test Steps**:
\`\`\`typescript
// Test malicious inputs
const maliciousInputs = [
  { field: 'email', value: '<script>alert("xss")</script>', expected: 'invalid' },
  { field: 'name', value: 'DROP TABLE users;', expected: 'invalid' },
  { field: 'phone', value: '1234567890123456789012345678901234567890', expected: 'invalid' }
];

for (const input of maliciousInputs) {
  const response = await fetch(`${baseUrl}/api/lead-capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [input.field]: input.value })
  });
  
  assert(response.status === 400, `Malicious input should be rejected: ${input.field}`);
}
\`\`\`
**Commands**: `pnpm test:security:input`
**Expected Result**: All malicious inputs are rejected with 400 status

#### Test: S1.6_Rate_Limiting
**Description**: Verify rate limiting is implemented on all endpoints
**Preconditions**: Rate limiting middleware configured
**Test Steps**:
\`\`\`typescript
// Test rate limiting by making rapid requests
const endpoint = '/api/chat';
const maxRequests = 100; // Configured limit

for (let i = 0; i < maxRequests + 10; i++) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] })
  });
  
  if (i >= maxRequests) {
    assert(response.status === 429, 'Rate limit should be enforced');
  }
}
\`\`\`
**Commands**: `pnpm test:security:rate-limit`
**Expected Result**: Requests beyond limit return 429 Too Many Requests

### 1.2 API Security Tests

#### Test: S2.1_Webhook_Signature_Validation
**Description**: Verify webhook signatures are validated
**Preconditions**: Webhook secret configured
**Test Steps**:
\`\`\`typescript
// Test webhook with invalid signature
const payload = JSON.stringify({ type: 'email.sent', data: {} });
const invalidSignature = 'invalid_signature';

const response = await fetch(`${baseUrl}/api/webhooks/resend`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'resend-signature': invalidSignature
  },
  body: payload
});

assert(response.status === 401, 'Invalid webhook signature should be rejected');
\`\`\`
**Commands**: `pnpm test:security:webhook`
**Expected Result**: Invalid signatures return 401 Unauthorized

#### Test: S2.2_CORS_Policy
**Description**: Verify CORS policies are properly configured
**Preconditions**: CORS middleware configured
**Test Steps**:
\`\`\`typescript
// Test CORS headers
const response = await fetch(`${baseUrl}/api/chat`, {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://malicious-site.com',
    'Access-Control-Request-Method': 'POST'
  }
});

const corsHeader = response.headers.get('Access-Control-Allow-Origin');
assert(corsHeader !== '*', 'CORS should not allow all origins');
\`\`\`
**Commands**: `pnpm test:security:cors`
**Expected Result**: CORS headers restrict origins appropriately

#### Test: S2.4_Request_Size_Limits
**Description**: Verify request size limits are enforced
**Preconditions**: Request size limiting configured
**Test Steps**:
\`\`\`typescript
// Test oversized request
const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB

const response = await fetch(`${baseUrl}/api/upload`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: largePayload })
});

assert(response.status === 413, 'Oversized request should be rejected');
\`\`\`
**Commands**: `pnpm test:security:request-size`
**Expected Result**: Oversized requests return 413 Payload Too Large

### 1.3 Data Security Tests

#### Test: S3.1_PII_Encryption
**Description**: Verify PII data is encrypted at rest
**Preconditions**: Database encryption configured
**Test Steps**:
\`\`\`typescript
// Check database encryption status
const supabase = getSupabase();
const { data: encryptionStatus } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public');

// Verify encryption is enabled for tables with PII
const piiTables = ['lead_summaries', 'meetings'];
for (const table of piiTables) {
  const { data: tableInfo } = await supabase
    .rpc('get_table_encryption_status', { table_name: table });
  
  assert(tableInfo.encrypted, `Table ${table} should be encrypted`);
}
\`\`\`
**Commands**: `pnpm test:security:encryption`
**Expected Result**: All PII tables are encrypted

#### Test: S3.3_SQL_Injection_Prevention
**Description**: Verify SQL injection prevention
**Preconditions**: Database with test data
**Test Steps**:
\`\`\`typescript
// Test SQL injection attempts
const injectionAttempts = [
  "'; DROP TABLE lead_summaries; --",
  "' OR '1'='1",
  "'; INSERT INTO lead_summaries VALUES (1, 'hacked'); --"
];

for (const attempt of injectionAttempts) {
  const response = await fetch(`${baseUrl}/api/admin/leads?search=${encodeURIComponent(attempt)}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  // Should not crash or return unexpected data
  assert(response.status !== 500, 'SQL injection should not cause server error');
}
\`\`\`
**Commands**: `pnpm test:security:sql-injection`
**Expected Result**: SQL injection attempts are safely handled

## 2. Compliance Tests

### 2.1 GDPR Compliance Tests

#### Test: C1.1_Data_Subject_Rights
**Description**: Verify data subject rights implementation
**Preconditions**: GDPR compliance system configured
**Test Steps**:
\`\`\`typescript
// Test data access right
const response = await fetch(`${baseUrl}/api/gdpr/access`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
});

assert(response.status === 200, 'Data access request should be processed');
const data = await response.json();
assert(data.userData, 'User data should be returned');
\`\`\`
**Commands**: `pnpm test:compliance:gdpr-access`
**Expected Result**: Data access requests return user data

#### Test: C1.2_Data_Processing_Records
**Description**: Verify data processing records are maintained
**Preconditions**: Audit logging system configured
**Test Steps**:
\`\`\`typescript
// Check audit logs for data processing
const supabase = getSupabase();
const { data: auditLogs } = await supabase
  .from('audit_logs')
  .select('*')
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

assert(auditLogs.length > 0, 'Audit logs should be maintained');
\`\`\`
**Commands**: `pnpm test:compliance:audit-logs`
**Expected Result**: Audit logs contain data processing records

#### Test: C1.3_Consent_Management
**Description**: Verify consent management system
**Preconditions**: Consent management configured
**Test Steps**:
\`\`\`typescript
// Test consent tracking
const consentData = {
  email: 'test@example.com',
  consentType: 'marketing',
  granted: true,
  timestamp: new Date().toISOString()
};

const response = await fetch(`${baseUrl}/api/gdpr/consent`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(consentData)
});

assert(response.status === 200, 'Consent should be recorded');
\`\`\`
**Commands**: `pnpm test:compliance:consent`
**Expected Result**: Consent is properly recorded and retrievable

### 2.2 Data Privacy Tests

#### Test: C2.1_Data_Minimization
**Description**: Verify only necessary data is collected
**Preconditions**: Data collection forms configured
**Test Steps**:
\`\`\`typescript
// Check lead capture form fields
const response = await fetch(`${baseUrl}/api/lead-capture/schema`);
const schema = await response.json();

const requiredFields = ['name', 'email'];
const optionalFields = ['company', 'phone'];

// Verify only necessary fields are required
for (const field of requiredFields) {
  assert(schema.required.includes(field), `Required field ${field} should be present`);
}

// Verify optional fields are not required
for (const field of optionalFields) {
  assert(!schema.required.includes(field), `Optional field ${field} should not be required`);
}
\`\`\`
**Commands**: `pnpm test:compliance:data-minimization`
**Expected Result**: Only necessary fields are required

#### Test: C2.2_Data_Anonymization
**Description**: Verify data anonymization for analytics
**Preconditions**: Anonymization system configured
**Test Steps**:
\`\`\`typescript
// Test analytics data anonymization
const response = await fetch(`${baseUrl}/api/admin/analytics`);
const analyticsData = await response.json();

// Check that PII is not present in analytics
const piiFields = ['email', 'phone', 'address'];
for (const field of piiFields) {
  assert(!JSON.stringify(analyticsData).includes(field), 
    `Analytics should not contain PII field: ${field}`);
}
\`\`\`
**Commands**: `pnpm test:compliance:anonymization`
**Expected Result**: Analytics data contains no PII

## 3. Performance Tests

### 3.1 Response Time Tests

#### Test: P1.1_API_Response_Time
**Description**: Verify API endpoints respond within 2 seconds
**Preconditions**: Server running, test data available
**Test Steps**:
\`\`\`typescript
// Test response times for all endpoints
const endpoints = [
  '/api/chat',
  '/api/lead-capture',
  '/api/admin/leads',
  '/api/admin/analytics'
];

for (const endpoint of endpoints) {
  const startTime = Date.now();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${testToken}` }
  });
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  assert(responseTime < 2000, `Endpoint ${endpoint} should respond within 2 seconds`);
}
\`\`\`
**Commands**: `pnpm test:performance:response-time`
**Expected Result**: All endpoints respond within 2 seconds

#### Test: P1.2_Database_Query_Performance
**Description**: Verify database queries complete within 500ms
**Preconditions**: Database with test data
**Test Steps**:
\`\`\`typescript
// Test database query performance
const supabase = getSupabase();
const startTime = Date.now();

const { data, error } = await supabase
  .from('lead_summaries')
  .select('*')
  .limit(100);

const endTime = Date.now();
const queryTime = endTime - startTime;

assert(queryTime < 500, 'Database query should complete within 500ms');
assert(!error, 'Query should not have errors');
\`\`\`
**Commands**: `pnpm test:performance:database`
**Expected Result**: Database queries complete within 500ms

#### Test: P1.3_File_Upload_Performance
**Description**: Verify file uploads complete within 30 seconds
**Preconditions**: File upload system configured
**Test Steps**:
\`\`\`typescript
// Test file upload performance
const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
const formData = new FormData();
formData.append('file', testFile);

const startTime = Date.now();
const response = await fetch(`${baseUrl}/api/upload`, {
  method: 'POST',
  body: formData
});
const endTime = Date.now();
const uploadTime = endTime - startTime;

assert(uploadTime < 30000, 'File upload should complete within 30 seconds');
assert(response.status === 200, 'Upload should be successful');
\`\`\`
**Commands**: `pnpm test:performance:upload`
**Expected Result**: File uploads complete within 30 seconds

### 3.2 Caching Tests

#### Test: P2.1_Cache_Hit_Rate
**Description**: Verify caching improves performance
**Preconditions**: Caching system configured
**Test Steps**:
\`\`\`typescript
// Test cache effectiveness
const endpoint = '/api/admin/analytics';
const iterations = 10;

// First request (cache miss)
const startTime1 = Date.now();
await fetch(`${baseUrl}${endpoint}`, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
const time1 = Date.now() - startTime1;

// Subsequent requests (cache hits)
const startTime2 = Date.now();
for (let i = 0; i < iterations; i++) {
  await fetch(`${baseUrl}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
}
const time2 = (Date.now() - startTime2) / iterations;

assert(time2 < time1, 'Cached requests should be faster');
\`\`\`
**Commands**: `pnpm test:performance:cache`
**Expected Result**: Cached requests are significantly faster

## 4. Scalability Tests

### 4.1 Load Testing

#### Test: SC1.1_Concurrent_Users
**Description**: Verify system handles concurrent users
**Preconditions**: Load testing environment configured
**Test Steps**:
\`\`\`typescript
// Simulate concurrent users
const concurrentUsers = 100;
const promises = [];

for (let i = 0; i < concurrentUsers; i++) {
  promises.push(
    fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Test message ${i}` }]
      })
    })
  );
}

const responses = await Promise.all(promises);
const successCount = responses.filter(r => r.status === 200).length;

assert(successCount >= concurrentUsers * 0.95, '95% of requests should succeed');
\`\`\`
**Commands**: `pnpm test:scalability:concurrent`
**Expected Result**: System handles 100 concurrent users with 95% success rate

#### Test: SC1.2_Auto_Scaling
**Description**: Verify auto-scaling triggers work
**Preconditions**: Auto-scaling configured
**Test Steps**:
\`\`\`typescript
// Monitor scaling during load test
const startMetrics = await getSystemMetrics();
await runLoadTest(1000); // 1000 requests
const endMetrics = await getSystemMetrics();

assert(endMetrics.instanceCount > startMetrics.instanceCount, 
  'System should scale up under load');
\`\`\`
**Commands**: `pnpm test:scalability:auto-scaling`
**Expected Result**: System scales up under load

## 5. Observability Tests

### 5.1 Monitoring Tests

#### Test: O1.1_Health_Checks
**Description**: Verify health check endpoints work
**Preconditions**: Health check system configured
**Test Steps**:
\`\`\`typescript
// Test health check endpoints
const healthEndpoints = [
  '/api/health',
  '/api/health/database',
  '/api/health/external-services'
];

for (const endpoint of healthEndpoints) {
  const response = await fetch(`${baseUrl}${endpoint}`);
  const health = await response.json();
  
  assert(response.status === 200, `Health check ${endpoint} should return 200`);
  assert(health.status === 'healthy', `Health check ${endpoint} should be healthy`);
}
\`\`\`
**Commands**: `pnpm test:observability:health`
**Expected Result**: All health checks return healthy status

#### Test: O1.2_Metrics_Collection
**Description**: Verify metrics are collected
**Preconditions**: Metrics collection configured
**Test Steps**:
\`\`\`typescript
// Check metrics endpoint
const response = await fetch(`${baseUrl}/api/metrics`);
const metrics = await response.json();

assert(metrics.requestCount !== undefined, 'Request count should be tracked');
assert(metrics.errorRate !== undefined, 'Error rate should be tracked');
assert(metrics.responseTime !== undefined, 'Response time should be tracked');
\`\`\`
**Commands**: `pnpm test:observability:metrics`
**Expected Result**: All required metrics are collected

### 5.2 Logging Tests

#### Test: O2.1_Structured_Logging
**Description**: Verify structured logging is implemented
**Preconditions**: Logging system configured
**Test Steps**:
\`\`\`typescript
// Trigger an action and check logs
await fetch(`${baseUrl}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] })
});

// Check logs for structured format
const logs = await getRecentLogs();
const logEntry = logs[logs.length - 1];

assert(logEntry.timestamp, 'Log should have timestamp');
assert(logEntry.level, 'Log should have level');
assert(logEntry.message, 'Log should have message');
assert(logEntry.correlationId, 'Log should have correlation ID');
\`\`\`
**Commands**: `pnpm test:observability:logging`
**Expected Result**: Logs are structured and contain required fields

## 6. CI/CD Tests

### 6.1 Pipeline Tests

#### Test: CD1.1_Dependency_Scanning
**Description**: Verify dependency vulnerability scanning
**Preconditions**: Security scanning configured
**Test Steps**:
\`\`\`bash
# Run security scan
npm audit --audit-level=high
\`\`\`
**Commands**: `pnpm test:ci:security-scan`
**Expected Result**: No high or critical vulnerabilities found

#### Test: CD1.2_Automated_Testing
**Description**: Verify automated tests run in pipeline
**Preconditions**: Test suite configured
**Test Steps**:
\`\`\`bash
# Run all tests
pnpm test:unit
pnpm test:integration
pnpm test:e2e
\`\`\`
**Commands**: `pnpm test:ci:automated`
**Expected Result**: All tests pass

#### Test: CD1.3_Code_Coverage
**Description**: Verify code coverage requirements
**Preconditions**: Coverage reporting configured
**Test Steps**:
\`\`\`bash
# Run tests with coverage
pnpm test:coverage
\`\`\`
**Commands**: `pnpm test:ci:coverage`
**Expected Result**: Code coverage >= 80%

## 7. Disaster Recovery Tests

### 7.1 Backup Tests

#### Test: DR1.1_Backup_Verification
**Description**: Verify database backups are created
**Preconditions**: Backup system configured
**Test Steps**:
\`\`\`typescript
// Check backup status
const backupStatus = await checkBackupStatus();
assert(backupStatus.lastBackup, 'Last backup should exist');
assert(backupStatus.backupAge < 24 * 60 * 60 * 1000, 'Backup should be less than 24 hours old');
\`\`\`
**Commands**: `pnpm test:dr:backup`
**Expected Result**: Recent backups exist and are valid

#### Test: DR1.2_Backup_Restoration
**Description**: Verify backup restoration works
**Preconditions**: Test environment available
**Test Steps**:
\`\`\`typescript
// Test backup restoration
const restoreResult = await restoreFromBackup('test-backup');
assert(restoreResult.success, 'Backup restoration should succeed');
assert(restoreResult.dataIntegrity, 'Restored data should be intact');
\`\`\`
**Commands**: `pnpm test:dr:restore`
**Expected Result**: Backup restoration succeeds with data integrity

## 8. Testing Rules Validation

### 8.1 Unit Test Coverage

#### Test: T1.1_Code_Coverage_Threshold
**Description**: Verify 80% code coverage is maintained
**Preconditions**: Coverage reporting configured
**Test Steps**:
\`\`\`bash
# Generate coverage report
pnpm test:coverage:report
\`\`\`
**Commands**: `pnpm test:coverage:threshold`
**Expected Result**: Coverage >= 80%

#### Test: T1.2_Business_Logic_Tests
**Description**: Verify all business logic is tested
**Preconditions**: Test suite configured
**Test Steps**:
\`\`\`typescript
// Check test files exist for all business logic
const businessLogicFiles = [
  'lib/token-cost-calculator.ts',
  'lib/email-service.ts',
  'lib/meeting-scheduler.ts'
];

for (const file of businessLogicFiles) {
  const testFile = file.replace('.ts', '.test.ts');
  assert(fs.existsSync(testFile), `Test file should exist for ${file}`);
}
\`\`\`
**Commands**: `pnpm test:business-logic`
**Expected Result**: All business logic files have corresponding tests

## 9. Network Tests

### 9.1 Network Security Tests

#### Test: N1.1_Port_Security
**Description**: Verify only necessary ports are open
**Preconditions**: Network configuration available
**Test Steps**:
\`\`\`bash
# Check open ports
nmap -p 80,443,3000 localhost
\`\`\`
**Commands**: `pnpm test:network:ports`
**Expected Result**: Only necessary ports (80, 443, 3000) are open

#### Test: N1.2_SSL_TLS_Configuration
**Description**: Verify SSL/TLS is properly configured
**Preconditions**: SSL certificate configured
**Test Steps**:
\`\`\`bash
# Test SSL configuration
openssl s_client -connect localhost:443 -servername localhost
\`\`\`
**Commands**: `pnpm test:network:ssl`
**Expected Result**: SSL/TLS is properly configured with strong ciphers

## 10. Cost Management Tests

### 10.1 Resource Monitoring

#### Test: CM1.1_Resource_Usage_Monitoring
**Description**: Verify resource usage is monitored
**Preconditions**: Monitoring system configured
**Test Steps**:
\`\`\`typescript
// Check resource usage metrics
const metrics = await getResourceMetrics();
assert(metrics.cpu !== undefined, 'CPU usage should be monitored');
assert(metrics.memory !== undefined, 'Memory usage should be monitored');
assert(metrics.storage !== undefined, 'Storage usage should be monitored');
\`\`\`
**Commands**: `pnpm test:cost:monitoring`
**Expected Result**: All resource metrics are collected

#### Test: CM1.2_Budget_Alerts
**Description**: Verify budget alerts are configured
**Preconditions**: Budget monitoring configured
**Test Steps**:
\`\`\`typescript
// Check budget alert configuration
const budgetConfig = await getBudgetConfig();
assert(budgetConfig.alerts.length > 0, 'Budget alerts should be configured');
assert(budgetConfig.threshold < 1.0, 'Alert threshold should be less than 100%');
\`\`\`
**Commands**: `pnpm test:cost:budget`
**Expected Result**: Budget alerts are properly configured

## 11. API Versioning Tests

### 11.1 Version Management

#### Test: AV1.1_Semantic_Versioning
**Description**: Verify semantic versioning is used
**Preconditions**: API versioning configured
**Test Steps**:
\`\`\`typescript
// Check API version headers
const response = await fetch(`${baseUrl}/api/chat`);
const version = response.headers.get('X-API-Version');

assert(version, 'API version header should be present');
assert(/^\d+\.\d+\.\d+$/.test(version), 'Version should follow semantic versioning');
\`\`\`
**Commands**: `pnpm test:api:versioning`
**Expected Result**: API uses semantic versioning

#### Test: AV1.2_Backward_Compatibility
**Description**: Verify backward compatibility
**Preconditions**: Multiple API versions available
**Test Steps**:
\`\`\`typescript
// Test backward compatibility
const oldVersion = '1.0.0';
const newVersion = '2.0.0';

const oldResponse = await fetch(`${baseUrl}/api/v1/chat`, {
  headers: { 'X-API-Version': oldVersion }
});

const newResponse = await fetch(`${baseUrl}/api/v2/chat`, {
  headers: { 'X-API-Version': newVersion }
});

assert(oldResponse.status === 200, 'Old version should still work');
assert(newResponse.status === 200, 'New version should work');
\`\`\`
**Commands**: `pnpm test:api:compatibility`
**Expected Result**: Both old and new versions work

## Integration Instructions

### 1. Test Environment Setup

\`\`\`bash
# Install test dependencies
pnpm add -D jest @types/jest supertest @types/supertest

# Configure test environment
cp .env.example .env.test
\`\`\`

### 2. Test Scripts

Add to `package.json`:

\`\`\`json
{
  "scripts": {
    "test:security": "jest --testPathPattern=security",
    "test:compliance": "jest --testPathPattern=compliance",
    "test:performance": "jest --testPathPattern=performance",
    "test:scalability": "jest --testPathPattern=scalability",
    "test:observability": "jest --testPathPattern=observability",
    "test:ci": "jest --testPathPattern=ci",
    "test:dr": "jest --testPathPattern=disaster-recovery",
    "test:network": "jest --testPathPattern=network",
    "test:cost": "jest --testPathPattern=cost",
    "test:api": "jest --testPathPattern=api",
    "test:all": "pnpm test:security && pnpm test:compliance && pnpm test:performance && pnpm test:scalability && pnpm test:observability && pnpm test:ci && pnpm test:dr && pnpm test:network && pnpm test:cost && pnpm test:api"
  }
}
\`\`\`

### 3. CI/CD Integration

Add to `.github/workflows/compliance-tests.yml`:

\`\`\`yaml
name: Compliance Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:all
      - run: pnpm test:coverage
\`\`\`

### 4. Monitoring Integration

Configure alerts for test failures:

\`\`\`typescript
// Alert configuration
const alertConfig = {
  testFailureThreshold: 0.95, // 95% pass rate
  notificationChannels: ['email', 'slack'],
  escalationTime: 30 * 60 * 1000 // 30 minutes
};
\`\`\`

### 5. Regular Compliance Checks

Schedule regular compliance checks:

\`\`\`bash
# Daily compliance check
0 2 * * * cd /path/to/project && pnpm test:all

# Weekly security scan
0 3 * * 0 cd /path/to/project && pnpm test:security
\`\`\`

This comprehensive test suite ensures all backend architecture rules are validated and maintained throughout the development lifecycle.
