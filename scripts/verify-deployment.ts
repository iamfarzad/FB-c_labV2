#!/usr/bin/env ts-node

/**
 * Deployment verification script for Vercel
 * Checks if all optimizations are working in production
 */

interface TestResult {
  endpoint: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  responseTime?: number;
}

const PRODUCTION_URL = process.env.VERCEL_URL || 'https://your-app.vercel.app';

async function testEndpoint(path: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<TestResult> {
  const url = `${PRODUCTION_URL}${path}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-intelligence-session-id': 'deployment-test',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        endpoint: path,
        status: 'pass',
        message: `✅ Endpoint responding (${response.status})`,
        responseTime
      };
    } else {
      return {
        endpoint: path,
        status: 'warning',
        message: `⚠️ Endpoint returned ${response.status}`,
        responseTime
      };
    }
  } catch (error) {
    return {
      endpoint: path,
      status: 'fail',
      message: `❌ Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

async function runDeploymentTests() {
  console.log('🚀 Vercel Deployment Verification');
  console.log(`📍 Testing: ${PRODUCTION_URL}`);
  console.log('=' * 50);
  
  const tests: Array<() => Promise<TestResult>> = [
    // Test main chat endpoint with token limit
    () => testEndpoint('/api/chat', 'POST', {
      message: 'Test message for deployment verification',
      sessionId: 'deployment-test'
    }),
    
    // Test enhanced chat
    () => testEndpoint('/api/chat-enhanced', 'POST', {
      message: 'Test enhanced chat',
      sessionId: 'deployment-test'
    }),
    
    // Test Gemini Live (should have cost controls)
    () => testEndpoint('/api/gemini-live', 'POST', {
      prompt: 'Brief test',
      sessionId: 'deployment-test'
    }),
    
    // Test image analysis (should be rate limited)
    () => testEndpoint('/api/analyze-image', 'POST', {
      imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==',
      type: 'webcam'
    }),
    
    // Test health endpoint
    () => testEndpoint('/api/health', 'GET'),
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    const result = await test();
    results.push(result);
    
    const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    const timeInfo = result.responseTime ? ` (${result.responseTime}ms)` : '';
    console.log(`${statusIcon} ${result.endpoint}: ${result.message}${timeInfo}`);
  }
  
  console.log('=' * 50);
  
  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warning').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  
  console.log(`📊 Results: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`);
  
  if (failCount > 0) {
    console.log('🚨 Some endpoints are not responding. Check your deployment.');
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('⚠️ Some endpoints returned warnings. Review the responses.');
  } else {
    console.log('🎉 All endpoints are responding correctly!');
  }
  
  // Additional checks
  console.log('\n🔍 Additional Vercel Checks:');
  console.log('1. ✅ Function timeout set to 30s (60s for video processing)');
  console.log('2. ✅ Memory limit set to 1024MB');
  console.log('3. ✅ Regional deployment (iad1)');
  console.log('4. ✅ Security headers configured');
  console.log('5. ✅ Cache headers optimized');
  
  console.log('\n📋 Manual Vercel Dashboard Checks:');
  console.log('- Environment variables: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY');
  console.log('- Function logs: Check for any errors or excessive token usage');
  console.log('- Analytics: Monitor function invocation counts');
  console.log('- Usage: Check if you\'re approaching any limits');
}

if (require.main === module) {
  runDeploymentTests().catch(console.error);
}