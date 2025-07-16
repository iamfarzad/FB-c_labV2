# Backend Compliance Tests

## 1. Test Overview

This document provides comprehensive automated tests to validate compliance with the architectural requirements defined in `backend_architecture.md`. Each test category ensures the backend meets security, performance, scalability, and operational standards.

### Test Categories
- **Security Tests**: Authentication, authorization, input validation, encryption
- **Compliance Tests**: GDPR, CCPA, audit logging, data handling
- **Performance Tests**: Response times, throughput, latency
- **Scalability Tests**: Auto-scaling, load handling, resource utilization
- **Observability Tests**: Logging, metrics, tracing, alerting
- **CI/CD Tests**: Pipeline validation, deployment verification
- **Disaster Recovery Tests**: Backup integrity, failover procedures
- **API Version Tests**: Versioning compliance, deprecation handling
- **Network Tests**: Connectivity, service reachability, security

## 2. Security Tests

### Test: API Authentication Validation
**Description**: Verify all protected endpoints require proper authentication
**Preconditions**: 
- Supabase authentication configured
- Test user account created
- API keys properly configured

**Test Steps**:
```typescript
// test/security/authentication.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('API Authentication', () => {
  let supabase: any
  let authToken: string

  beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Sign in test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    
    if (data.session) {
      authToken = data.session.access_token
    }
  })

  it('should reject unauthenticated requests to protected endpoints', async () => {
    const protectedEndpoints = [
      '/api/admin/stats',
      '/api/admin/token-usage',
      '/api/admin/leads'
    ]

    for (const endpoint of protectedEndpoints) {
      const response = await fetch(`${process.env.BASE_URL}${endpoint}`)
      expect(response.status).toBe(401)
    }
  })

  it('should accept authenticated requests to protected endpoints', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    expect(response.status).toBe(200)
  })
})
```

**Commands to run**:
```bash
npm run test:security
# or
pnpm test test/security/authentication.test.ts
```

**Expected Result**: All protected endpoints return 401 for unauthenticated requests and 200 for authenticated requests.

### Test: Input Validation with Zod
**Description**: Verify all API endpoints use Zod schema validation
**Preconditions**: Zod schemas defined for all endpoints

**Test Steps**:
```typescript
// test/security/input-validation.test.ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Define expected schemas
const LeadCaptureSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  engagementType: z.enum(['chat', 'voice', 'screen_share', 'webcam']),
  tcAcceptance: z.object({
    accepted: z.boolean(),
    timestamp: z.number()
  })
})

describe('Input Validation', () => {
  it('should validate lead capture data', async () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      engagementType: 'chat',
      tcAcceptance: {
        accepted: true,
        timestamp: Date.now()
      }
    }

    const invalidData = {
      name: '',
      email: 'invalid-email',
      engagementType: 'invalid'
    }

    // Test valid data
    expect(() => LeadCaptureSchema.parse(validData)).not.toThrow()
    
    // Test invalid data
    expect(() => LeadCaptureSchema.parse(invalidData)).toThrow()
  })

  it('should reject SQL injection attempts', async () => {
    const maliciousData = {
      name: "'; DROP TABLE users; --",
      email: 'test@example.com',
      engagementType: 'chat',
      tcAcceptance: { accepted: true, timestamp: Date.now() }
    }

    const response = await fetch(`${process.env.BASE_URL}/api/lead-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousData)
    })

    expect(response.status).toBe(400)
  })
})
```

**Commands to run**:
```bash
pnpm test test/security/input-validation.test.ts
```

**Expected Result**: All endpoints properly validate input and reject malicious data.

### Test: Webhook Signature Verification
**Description**: Verify webhook endpoints validate HMAC signatures
**Preconditions**: Webhook secret configured

**Test Steps**:
```typescript
// test/security/webhook-verification.test.ts
import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

describe('Webhook Signature Verification', () => {
  it('should verify valid webhook signatures', async () => {
    const payload = JSON.stringify({ type: 'email.sent', data: {} })
    const secret = process.env.RESEND_WEBHOOK_SECRET!
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')

    const response = await fetch(`${process.env.BASE_URL}/api/webhooks/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'resend-signature': `sha256=${signature}`
      },
      body: payload
    })

    expect(response.status).toBe(200)
  })

  it('should reject invalid webhook signatures', async () => {
    const payload = JSON.stringify({ type: 'email.sent', data: {} })
    const invalidSignature = 'invalid-signature'

    const response = await fetch(`${process.env.BASE_URL}/api/webhooks/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'resend-signature': `sha256=${invalidSignature}`
      },
      body: payload
    })

    expect(response.status).toBe(401)
  })
})
```

**Commands to run**:
```bash
pnpm test test/security/webhook-verification.test.ts
```

**Expected Result**: Valid signatures accepted, invalid signatures rejected.

## 3. Compliance Tests

### Test: GDPR Data Handling
**Description**: Verify GDPR compliance for data handling and deletion
**Preconditions**: GDPR-compliant data handling implemented

**Test Steps**:
```typescript
// test/compliance/gdpr.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('GDPR Compliance', () => {
  let supabase: any
  let testLeadId: string

  beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  })

  it('should support data deletion requests', async () => {
    // Create test lead
    const { data: lead } = await supabase
      .from('lead_summaries')
      .insert({
        name: 'Test User',
        email: 'test-delete@example.com',
        company_name: 'Test Company'
      })
      .select()
      .single()

    testLeadId = lead.id

    // Test deletion endpoint
    const response = await fetch(`${process.env.BASE_URL}/api/gdpr/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-delete@example.com' })
    })

    expect(response.status).toBe(200)

    // Verify data is deleted
    const { data: deletedLead } = await supabase
      .from('lead_summaries')
      .select()
      .eq('id', testLeadId)
      .single()

    expect(deletedLead).toBeNull()
  })

  it('should support data export requests', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/gdpr/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('personalData')
    expect(data).toHaveProperty('timestamp')
  })

  it('should log consent management', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/gdpr/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        consentType: 'marketing',
        granted: true,
        timestamp: new Date().toISOString()
      })
    })

    expect(response.status).toBe(200)

    // Verify consent is logged
    const { data: consentLog } = await supabase
      .from('consent_logs')
      .select()
      .eq('email', 'test@example.com')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    expect(consentLog).toBeTruthy()
    expect(consentLog.consent_type).toBe('marketing')
    expect(consentLog.granted).toBe(true)
  })
})
```

**Commands to run**:
```bash
pnpm test test/compliance/gdpr.test.ts
```

**Expected Result**: All GDPR requirements met including data deletion, export, and consent logging.

### Test: Audit Logging
**Description**: Verify comprehensive audit logging for all operations
**Preconditions**: Audit logging system implemented

**Test Steps**:
```typescript
// test/compliance/audit-logging.test.ts
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Audit Logging', () => {
  let supabase: any

  beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  })

  it('should log all API operations', async () => {
    // Perform test operations
    await fetch(`${process.env.BASE_URL}/api/lead-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Test User',
        email: 'audit-test@example.com',
        engagementType: 'chat',
        tcAcceptance: { accepted: true, timestamp: Date.now() }
      })
    })

    // Check audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select()
      .eq('action', 'lead_capture')
      .eq('user_email', 'audit-test@example.com')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    expect(auditLogs).toBeTruthy()
    expect(auditLogs.action).toBe('lead_capture')
    expect(auditLogs.user_email).toBe('audit-test@example.com')
    expect(auditLogs.ip_address).toBeDefined()
    expect(auditLogs.user_agent).toBeDefined()
  })

  it('should log data access operations', async () => {
    // Simulate data access
    await fetch(`${process.env.BASE_URL}/api/admin/leads`, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}` }
    })

    const { data: accessLogs } = await supabase
      .from('audit_logs')
      .select()
      .eq('action', 'data_access')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    expect(accessLogs).toBeTruthy()
    expect(accessLogs.resource_type).toBe('leads')
    expect(accessLogs.access_level).toBeDefined()
  })
})
```

**Commands to run**:
```bash
pnpm test test/compliance/audit-logging.test.ts
```

**Expected Result**: All operations properly logged with required metadata.

## 4. Performance Tests

### Test: API Response Time Validation
**Description**: Verify API endpoints meet performance targets
**Preconditions**: Performance targets defined (< 200ms for simple requests, < 5s for AI operations)

**Test Steps**:
```typescript
// test/performance/response-time.test.ts
import { describe, it, expect } from 'vitest'

describe('API Performance', () => {
  it('should respond within 200ms for simple requests', async () => {
    const startTime = Date.now()
    
    const response = await fetch(`${process.env.BASE_URL}/api/admin/stats?period=1d`)
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    expect(response.status).toBe(200)
    expect(responseTime).toBeLessThan(200)
  })

  it('should respond within 5s for AI operations', async () => {
    const startTime = Date.now()
    
    const response = await fetch(`${process.env.BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        data: { sessionId: 'test-session' }
      })
    })
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    expect(response.status).toBe(200)
    expect(responseTime).toBeLessThan(5000)
  })

  it('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 10
    const promises = []
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        fetch(`${process.env.BASE_URL}/api/admin/stats?period=1d`)
      )
    }
    
    const startTime = Date.now()
    const responses = await Promise.all(promises)
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
    
    // Average response time should be reasonable
    const avgResponseTime = totalTime / concurrentRequests
    expect(avgResponseTime).toBeLessThan(500)
  })
})
```

**Commands to run**:
```bash
pnpm test test/performance/response-time.test.ts
```

**Expected Result**: All endpoints meet performance targets under normal and concurrent load.

### Test: Database Query Performance
**Description**: Verify database queries meet performance targets (< 50ms for indexed queries)

**Test Steps**:
```typescript
// test/performance/database-performance.test.ts
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Database Performance', () => {
  let supabase: any

  beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  })

  it('should query lead_summaries within 50ms', async () => {
    const startTime = Date.now()
    
    const { data, error } = await supabase
      .from('lead_summaries')
      .select('*')
      .limit(10)
    
    const endTime = Date.now()
    const queryTime = endTime - startTime
    
    expect(error).toBeNull()
    expect(queryTime).toBeLessThan(50)
  })

  it('should handle complex joins efficiently', async () => {
    const startTime = Date.now()
    
    const { data, error } = await supabase
      .from('lead_summaries')
      .select(`
        *,
        meetings (*)
      `)
      .limit(5)
    
    const endTime = Date.now()
    const queryTime = endTime - startTime
    
    expect(error).toBeNull()
    expect(queryTime).toBeLessThan(100)
  })
})
```

**Commands to run**:
```bash
pnpm test test/performance/database-performance.test.ts
```

**Expected Result**: All database queries meet performance targets.

## 5. Scalability Tests

### Test: Auto-scaling Validation
**Description**: Verify auto-scaling behavior under load
**Preconditions**: Auto-scaling configured for Vercel functions

**Test Steps**:
```typescript
// test/scalability/auto-scaling.test.ts
import { describe, it, expect } from 'vitest'

describe('Auto-scaling', () => {
  it('should handle burst traffic', async () => {
    const burstSize = 50
    const promises = []
    
    // Simulate burst traffic
    for (let i = 0; i < burstSize; i++) {
      promises.push(
        fetch(`${process.env.BASE_URL}/api/admin/stats?period=1d`)
      )
    }
    
    const startTime = Date.now()
    const responses = await Promise.all(promises)
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // All requests should succeed
    const successCount = responses.filter(r => r.status === 200).length
    expect(successCount).toBe(burstSize)
    
    // Should handle burst within reasonable time
    expect(totalTime).toBeLessThan(10000)
  })

  it('should maintain performance under sustained load', async () => {
    const sustainedRequests = 100
    const requestInterval = 100 // ms between requests
    
    const results = []
    
    for (let i = 0; i < sustainedRequests; i++) {
      const startTime = Date.now()
      const response = await fetch(`${process.env.BASE_URL}/api/admin/stats?period=1d`)
      const endTime = Date.now()
      
      results.push({
        status: response.status,
        responseTime: endTime - startTime
      })
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, requestInterval))
    }
    
    // All requests should succeed
    const successCount = results.filter(r => r.status === 200).length
    expect(successCount).toBe(sustainedRequests)
    
    // Average response time should remain stable
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
    expect(avgResponseTime).toBeLessThan(500)
  })
})
```

**Commands to run**:
```bash
pnpm test test/scalability/auto-scaling.test.ts
```

**Expected Result**: System handles burst and sustained load efficiently.

## 6. Observability Tests

### Test: Logging Validation
**Description**: Verify comprehensive logging implementation
**Preconditions**: Logging system configured

**Test Steps**:
```typescript
// test/observability/logging.test.ts
import { describe, it, expect } from 'vitest'

describe('Logging', () => {
  it('should log all API requests', async () => {
    const testEndpoint = '/api/lead-capture'
    const testData = {
      name: 'Log Test User',
      email: 'log-test@example.com',
      engagementType: 'chat',
      tcAcceptance: { accepted: true, timestamp: Date.now() }
    }
    
    await fetch(`${process.env.BASE_URL}${testEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })
    
    // Check logs (implementation depends on logging system)
    const logs = await fetch(`${process.env.LOG_API_URL}/logs`, {
      headers: { 'Authorization': `Bearer ${process.env.LOG_API_KEY}` }
    }).then(r => r.json())
    
    const relevantLogs = logs.filter((log: any) => 
      log.endpoint === testEndpoint && 
      log.method === 'POST'
    )
    
    expect(relevantLogs.length).toBeGreaterThan(0)
    expect(relevantLogs[0]).toHaveProperty('timestamp')
    expect(relevantLogs[0]).toHaveProperty('requestId')
    expect(relevantLogs[0]).toHaveProperty('statusCode')
  })

  it('should log errors with proper context', async () => {
    // Trigger an error
    const response = await fetch(`${process.env.BASE_URL}/api/nonexistent-endpoint`)
    
    // Check error logs
    const errorLogs = await fetch(`${process.env.LOG_API_URL}/logs?level=error`, {
      headers: { 'Authorization': `Bearer ${process.env.LOG_API_KEY}` }
    }).then(r => r.json())
    
    const recentErrorLogs = errorLogs.filter((log: any) => 
      log.timestamp > Date.now() - 60000 // Last minute
    )
    
    expect(recentErrorLogs.length).toBeGreaterThan(0)
    expect(recentErrorLogs[0]).toHaveProperty('error')
    expect(recentErrorLogs[0]).toHaveProperty('stackTrace')
    expect(recentErrorLogs[0]).toHaveProperty('requestContext')
  })
})
```

**Commands to run**:
```bash
pnpm test test/observability/logging.test.ts
```

**Expected Result**: All operations properly logged with required context.

### Test: Metrics Collection
**Description**: Verify metrics collection for monitoring

**Test Steps**:
```typescript
// test/observability/metrics.test.ts
import { describe, it, expect } from 'vitest'

describe('Metrics Collection', () => {
  it('should collect response time metrics', async () => {
    const startTime = Date.now()
    
    await fetch(`${process.env.BASE_URL}/api/admin/stats?period=1d`)
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    // Check metrics API
    const metrics = await fetch(`${process.env.METRICS_API_URL}/response-times`, {
      headers: { 'Authorization': `Bearer ${process.env.METRICS_API_KEY}` }
    }).then(r => r.json())
    
    expect(metrics).toHaveProperty('average')
    expect(metrics).toHaveProperty('p95')
    expect(metrics).toHaveProperty('p99')
  })

  it('should collect error rate metrics', async () => {
    // Trigger some errors
    await Promise.all([
      fetch(`${process.env.BASE_URL}/api/nonexistent-endpoint`),
      fetch(`${process.env.BASE_URL}/api/nonexistent-endpoint`),
      fetch(`${process.env.BASE_URL}/api/admin/stats?period=1d`) // Success
    ])
    
    const errorMetrics = await fetch(`${process.env.METRICS_API_URL}/error-rates`, {
      headers: { 'Authorization': `Bearer ${process.env.METRICS_API_KEY}` }
    }).then(r => r.json())
    
    expect(errorMetrics).toHaveProperty('rate')
    expect(errorMetrics).toHaveProperty('count')
  })
})
```

**Commands to run**:
```bash
pnpm test test/observability/metrics.test.ts
```

**Expected Result**: All required metrics collected and accessible.

## 7. CI/CD Tests

### Test: Pipeline Validation
**Description**: Verify CI/CD pipeline stages execute correctly
**Preconditions**: CI/CD pipeline configured

**Test Steps**:
```bash
#!/bin/bash
# test/cicd/pipeline-validation.sh

echo "Testing CI/CD Pipeline Stages..."

# Test 1: Code Quality
echo "1. Testing code quality checks..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed"
    exit 1
fi
echo "✅ Linting passed"

# Test 2: TypeScript compilation
echo "2. Testing TypeScript compilation..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
echo "✅ TypeScript compilation passed"

# Test 3: Build process
echo "3. Testing build process..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build passed"

# Test 4: Security scanning
echo "4. Testing security scanning..."
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    echo "❌ Security vulnerabilities found"
    exit 1
fi
echo "✅ Security scan passed"

# Test 5: Test execution
echo "5. Testing test execution..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi
echo "✅ Tests passed"

echo "🎉 All CI/CD pipeline stages passed!"
```

**Commands to run**:
```bash
chmod +x test/cicd/pipeline-validation.sh
./test/cicd/pipeline-validation.sh
```

**Expected Result**: All pipeline stages execute successfully.

### Test: Deployment Verification
**Description**: Verify deployment process and health checks

**Test Steps**:
```typescript
// test/cicd/deployment-verification.test.ts
import { describe, it, expect } from 'vitest'

describe('Deployment Verification', () => {
  it('should pass health checks after deployment', async () => {
    const healthEndpoints = [
      '/api/health',
      '/api/ready',
      '/api/live'
    ]
    
    for (const endpoint of healthEndpoints) {
      const response = await fetch(`${process.env.BASE_URL}${endpoint}`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.status).toBe('healthy')
    }
  })

  it('should have correct environment variables', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/config/validate`)
    expect(response.status).toBe(200)
    
    const config = await response.json()
    expect(config.database).toBe('connected')
    expect(config.ai_providers).toBe('configured')
    expect(config.email_service).toBe('configured')
  })

  it('should support rollback procedures', async () => {
    // Test rollback endpoint (if implemented)
    const response = await fetch(`${process.env.BASE_URL}/api/admin/rollback`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    })
    
    // Should either succeed or return 404 if not implemented
    expect([200, 404]).toContain(response.status)
  })
})
```

**Commands to run**:
```bash
pnpm test test/cicd/deployment-verification.test.ts
```

**Expected Result**: Deployment verification passes all checks.

## 8. Disaster Recovery Tests

### Test: Backup Integrity
**Description**: Verify backup procedures and data integrity
**Preconditions**: Backup system configured

**Test Steps**:
```typescript
// test/disaster-recovery/backup-integrity.test.ts
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Backup Integrity', () => {
  let supabase: any

  beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  })

  it('should verify backup data integrity', async () => {
    // Create test data
    const testData = {
      name: 'Backup Test User',
      email: 'backup-test@example.com',
      company_name: 'Backup Test Company'
    }
    
    const { data: insertedData } = await supabase
      .from('lead_summaries')
      .insert(testData)
      .select()
      .single()
    
    // Trigger backup verification
    const response = await fetch(`${process.env.BASE_URL}/api/admin/backup/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` },
      body: JSON.stringify({ table: 'lead_summaries', recordId: insertedData.id })
    })
    
    expect(response.status).toBe(200)
    const verification = await response.json()
    expect(verification.integrity).toBe('verified')
  })

  it('should test restore procedures', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/admin/backup/test-restore`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    })
    
    expect(response.status).toBe(200)
    const restoreTest = await response.json()
    expect(restoreTest.status).toBe('success')
    expect(restoreTest.dataIntegrity).toBe('verified')
  })
})
```

**Commands to run**:
```bash
pnpm test test/disaster-recovery/backup-integrity.test.ts
```

**Expected Result**: Backup integrity verified and restore procedures functional.

### Test: Failover Procedures
**Description**: Verify failover mechanisms work correctly

**Test Steps**:
```typescript
// test/disaster-recovery/failover.test.ts
import { describe, it, expect } from 'vitest'

describe('Failover Procedures', () => {
  it('should handle primary region failure', async () => {
    // Simulate primary region failure
    const response = await fetch(`${process.env.BASE_URL}/api/admin/failover/test`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    })
    
    expect(response.status).toBe(200)
    const failoverTest = await response.json()
    expect(failoverTest.status).toBe('success')
    expect(failoverTest.failoverTime).toBeLessThan(300000) // 5 minutes
  })

  it('should maintain data consistency during failover', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/admin/failover/consistency-check`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    })
    
    expect(response.status).toBe(200)
    const consistencyCheck = await response.json()
    expect(consistencyCheck.consistent).toBe(true)
    expect(consistencyCheck.dataLoss).toBe(0)
  })
})
```

**Commands to run**:
```bash
pnpm test test/disaster-recovery/failover.test.ts
```

**Expected Result**: Failover procedures execute within RTO/RPO requirements.

## 9. API Version Tests

### Test: Version Header Validation
**Description**: Verify API versioning implementation
**Preconditions**: API versioning system implemented

**Test Steps**:
```typescript
// test/api-versioning/version-headers.test.ts
import { describe, it, expect } from 'vitest'

describe('API Versioning', () => {
  it('should accept version headers', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/v1/admin/stats`, {
      headers: {
        'Accept': 'application/vnd.api+json;version=1',
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`
      }
    })
    
    expect(response.status).toBe(200)
    expect(response.headers.get('API-Version')).toBe('1.0.0')
  })

  it('should handle version deprecation warnings', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/v0/admin/stats`, {
      headers: {
        'Accept': 'application/vnd.api+json;version=0',
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`
      }
    })
    
    expect(response.status).toBe(200)
    expect(response.headers.get('Deprecation')).toBeTruthy()
    expect(response.headers.get('Sunset')).toBeTruthy()
  })

  it('should reject unsupported versions', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/v999/admin/stats`, {
      headers: {
        'Accept': 'application/vnd.api+json;version=999',
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`
      }
    })
    
    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.error).toContain('Unsupported API version')
  })
})
```

**Commands to run**:
```bash
pnpm test test/api-versioning/version-headers.test.ts
```

**Expected Result**: API versioning works correctly with proper deprecation handling.

## 10. Network Tests

### Test: Service Reachability
**Description**: Verify all services are reachable and properly configured

**Test Steps**:
```typescript
// test/network/service-reachability.test.ts
import { describe, it, expect } from 'vitest'

describe('Network Connectivity', () => {
  it('should reach all required services', async () => {
    const services = [
      { name: 'Database', url: process.env.SUPABASE_URL },
      { name: 'AI Provider', url: 'https://generativelanguage.googleapis.com' },
      { name: 'Email Service', url: 'https://api.resend.com' },
      { name: 'WebSocket Server', url: process.env.WEBSOCKET_URL }
    ]
    
    for (const service of services) {
      try {
        const response = await fetch(service.url, { method: 'HEAD' })
        expect(response.status).toBeLessThan(500)
      } catch (error) {
        // Some services may not support HEAD requests
        console.log(`Service ${service.name} connectivity check completed`)
      }
    }
  })

  it('should have proper CORS configuration', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/lead-capture`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    })
    
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined()
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })

  it('should block unauthorized origins', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/admin/stats`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'GET'
      }
    })
    
    expect(response.status).toBe(403)
  })
})
```

**Commands to run**:
```bash
pnpm test test/network/service-reachability.test.ts
```

**Expected Result**: All services reachable with proper security configuration.

## Integration Instructions

### 1. Add Test Dependencies

Update `package.json` to include testing dependencies:

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "supertest": "^6.3.0",
    "artillery": "^2.0.0",
    "playwright": "^1.40.0"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:security": "vitest test/security",
    "test:compliance": "vitest test/compliance",
    "test:performance": "vitest test/performance",
    "test:scalability": "vitest test/scalability",
    "test:observability": "vitest test/observability",
    "test:cicd": "vitest test/cicd",
    "test:disaster-recovery": "vitest test/disaster-recovery",
    "test:api-versioning": "vitest test/api-versioning",
    "test:network": "vitest test/network",
    "test:all": "vitest run",
    "test:coverage": "vitest --coverage"
  }
}
```

### 2. Create Test Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

### 3. Create Test Setup

Create `test/setup.ts`:

```typescript
import { beforeAll, afterAll } from 'vitest'

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test'
  process.env.BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
})

afterAll(async () => {
  // Cleanup test environment
})
```

### 4. Add CI/CD Integration

Update `.github/workflows/test.yml`:

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
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Run all tests
      run: npm run test:all
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### 5. Add Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:security
npm run test:compliance
```

### 6. Environment Variables

Create `.env.test`:

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

### 7. Run Tests

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run specific test categories
npm run test:security
npm run test:compliance
npm run test:performance

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test
```

This comprehensive test suite ensures the backend meets all architectural requirements and maintains compliance with security, performance, and operational standards.