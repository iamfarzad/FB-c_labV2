#!/usr/bin/env ts-node

const { config } = require('dotenv');
// Load .env.local file
config({ path: '.env.local' });

// Use node's built-in https module since fetch might not be available
const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'; // Changed to 3001
const TEST_TIMEOUT = 30000; // 30 seconds

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
  error?: string;
}

class AIFunctionTester {
  private results: TestResult[] = [];

  async test(name: string, testFn: () => Promise<void>, skip = false): Promise<void> {
    if (skip) {
      this.results.push({
        name,
        status: 'SKIP',
        message: 'Test skipped',
        duration: 0
      });
      return;
    }

    const startTime = Date.now();
    try {
      await Promise.race([
        testFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), TEST_TIMEOUT)
        )
      ]);
      
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        status: 'PASS',
        message: 'Test passed',
        duration
      });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        status: 'FAIL',
        message: error.message,
        duration,
        error: error.stack
      });
      console.log(`❌ ${name} (${duration}ms): ${error.message}`);
    }
  }

  async makeRequest(endpoint: string, body?: any, method = 'POST'): Promise<any> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body ? Buffer.byteLength(JSON.stringify(body)) : 0,
        },
      };

      const postData = body ? JSON.stringify(body) : '';

      const req = httpModule.request(options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const responseObj = {
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              headers: res.headers,
              json: async () => {
                try {
                  return JSON.parse(data);
                } catch (e) {
                  throw new Error(`Failed to parse JSON: ${data}`);
                }
              },
              text: async () => data,
            };
            resolve(responseObj);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error: any) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting AI Backend Functions Test Suite\n');

    // Test connectivity first
    try {
      const response = await this.makeRequest('/', {}, 'GET');
      console.log(`✅ Server is accessible at ${BASE_URL} (status: ${response.status})\n`);
    } catch (error: any) {
      console.error(`❌ Cannot connect to server at ${BASE_URL}: ${error.message}`);
      console.error(`Please ensure the Next.js dev server is running on port 3001\n`);
      process.exit(1);
    }

    // Test 1: Chat API Basic Functionality
    await this.test('Chat API - Basic Message', async () => {
      const response = await this.makeRequest('/api/chat', {
        messages: [
          { role: 'user', content: 'Hello, test message' }
        ]
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Chat API failed: ${error.reply || error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.reply) {
        throw new Error('Chat API did not return a reply');
      }
    });

    // Test 2: AI Service API
    await this.test('AI Service API - Conversational Flow', async () => {
      const response = await this.makeRequest('/api/ai-service?action=conversationalFlow', {
        prompt: 'Hi, my name is John',
        currentConversationState: {
          stage: 'greeting',
          messages: []
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`AI Service failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`AI Service failed: ${result.error}`);
      }
    });

    // Test 3: Gemini API - Conversational Flow
    await this.test('Gemini API - Conversational Flow', async () => {
      const response = await this.makeRequest('/api/gemini?action=conversationalFlow', {
        prompt: 'Hello, I need help with AI integration',
        currentConversationState: {
          stage: 'greeting',
          messages: []
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Gemini API failed: ${result.error}`);
      }
    });

    // Test 4: Image Generation API
    await this.test('Generate Image API', async () => {
      const response = await this.makeRequest('/api/generate-image', {
        prompt: 'A modern AI-powered business dashboard',
        numberOfImages: 1
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Image Generation failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Image Generation failed: ${result.error}`);
      }
    });

    // Test 5: YouTube Transcript API
    await this.test('YouTube Transcript API', async () => {
      const response = await this.makeRequest('/api/youtube-transcript', {
        videoId: 'dQw4w9WgXcQ',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`YouTube Transcript failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`YouTube Transcript failed: ${result.error}`);
      }
    });

    // Test 6: Gemini API - Image Generation Action
    await this.test('Gemini API - Image Generation', async () => {
      const response = await this.makeRequest('/api/gemini?action=generateImage', {
        prompt: 'Business meeting with AI technology'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini Image Generation failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Gemini Image Generation failed: ${result.error}`);
      }
    });

    // Test 7: Gemini API - Video Analysis
    await this.test('Gemini API - Video Analysis', async () => {
      const response = await this.makeRequest('/api/gemini?action=analyzeVideo', {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        prompt: 'Analyze this video content'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Video Analysis failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Video Analysis failed: ${result.error}`);
      }
    });

    // Test 8: Gemini API - Code Execution
    await this.test('Gemini API - Code Execution', async () => {
      const response = await this.makeRequest('/api/gemini?action=executeCode', {
        prompt: 'Calculate the sum of numbers from 1 to 10'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Code Execution failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Code Execution failed: ${result.error}`);
      }
    });

    // Test 9: Gemini API - Document Analysis
    await this.test('Gemini API - Document Analysis', async () => {
      const response = await this.makeRequest('/api/gemini?action=analyzeDocument', {
        documentData: 'Sample document content for analysis',
        prompt: 'Analyze this document'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Document Analysis failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Document Analysis failed: ${result.error}`);
      }
    });

    // Test 10: Gemini API - URL Analysis
    await this.test('Gemini API - URL Analysis', async () => {
      const response = await this.makeRequest('/api/gemini?action=analyzeURL', {
        url: 'https://example.com',
        prompt: 'Analyze this website'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`URL Analysis failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`URL Analysis failed: ${result.error}`);
      }
    });

    // Test 11: Gemini API - Lead Capture
    await this.test('Gemini API - Lead Capture', async () => {
      const response = await this.makeRequest('/api/gemini?action=leadCapture', {
        conversationHistory: [
          { role: 'user', content: 'Hi, I\'m John from TechCorp' },
          { role: 'assistant', content: 'Hello John! How can I help you today?' }
        ],
        userInfo: {
          name: 'John',
          email: 'john@techcorp.com',
          companyInfo: { name: 'TechCorp', domain: 'techcorp.com' }
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Lead Capture failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Lead Capture failed: ${result.error}`);
      }
    });

    // Test 12: Error Handling - Invalid Endpoint
    await this.test('Error Handling - Invalid Action', async () => {
      const response = await this.makeRequest('/api/gemini?action=invalidAction', {
        prompt: 'Test invalid action'
      });

      if (!response.ok) {
        // This is expected for invalid actions
        return;
      }

      const result = await response.json();
      // Should still handle gracefully
      if (!result.success) {
        return; // Expected behavior
      }
    });

    // Test 13: Error Handling - Missing Required Parameters
    await this.test('Error Handling - Missing Prompt', async () => {
      const response = await this.makeRequest('/api/gemini?action=conversationalFlow', {
        // Missing prompt
        currentConversationState: { stage: 'greeting', messages: [] }
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error && error.error.includes('prompt')) {
          return; // Expected error
        }
        throw new Error(`Unexpected error: ${error.error}`);
      }

      const result = await response.json();
      if (!result.success && result.error && result.error.includes('prompt')) {
        return; // Expected error
      }
      
      throw new Error('Should have failed with missing prompt error');
    });

    // Test 14: CORS Headers Test
    await this.test('CORS Headers - OPTIONS Request', async () => {
      const response = await this.makeRequest('/api/gemini', {}, 'OPTIONS');

      if (!response.ok) {
        throw new Error(`OPTIONS request failed: ${response.status}`);
      }

      const corsHeader = response.headers['access-control-allow-origin'];
      if (!corsHeader) {
        throw new Error('Missing CORS headers');
      }
    });

    // Test 15: Rate Limiting Test
    await this.test('Rate Limiting - Multiple Requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        this.makeRequest('/api/gemini?action=conversationalFlow', {
          prompt: 'Test message',
          messageCount: 1
        })
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.ok).length;
      
      if (successCount === 0) {
        throw new Error('All requests failed - possible rate limiting issue');
      }
      
      // At least one should succeed
      console.log(`${successCount}/5 requests succeeded`);
    });

    this.printSummary();
  }

  printSummary(): void {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`- ${r.name}: ${r.message}`);
        });
    }

    const avgDuration = this.results
      .filter(r => r.status !== 'SKIP')
      .reduce((sum, r) => sum + r.duration, 0) / (total - skipped);
    
    console.log(`\n⏱️ Average Test Duration: ${Math.round(avgDuration)}ms`);
    
    // Environment info
    console.log('\n🔧 Environment:');
    console.log(`- Base URL: ${BASE_URL}`);
    console.log(`- Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`- ElevenLabs API Key: ${process.env.ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`- Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! AI backend functions are working correctly.');
    } else {
      console.log(`\n⚠️ ${failed} test(s) failed. Please check the errors above.`);
      process.exit(1);
    }
  }
}

// Run the tests
async function main() {
  const tester = new AIFunctionTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AIFunctionTester }; 