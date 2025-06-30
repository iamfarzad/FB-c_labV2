#!/usr/bin/env ts-node

const { config } = require('dotenv');
// Load .env.local file
config({ path: '.env.local' });

// Use node's built-in https module since fetch might not be available
const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 60000; // 60 seconds

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
              json: async () => JSON.parse(data),
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

      req.setTimeout(TEST_TIMEOUT - 1000, () => {
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
      console.error(`Please ensure the Next.js dev server is running on port 3000\n`);
      process.exit(1);
    }

    // Test 1: Unified AI API - Conversational Flow
    await this.test('Unified AI API - Conversational Flow', async () => {
      const response = await this.makeRequest('/api/ai?action=conversationalFlow', {
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

    // Test 2: Unified AI API - Generate Image
    await this.test('Unified AI API - Generate Image', async () => {
      const response = await this.makeRequest('/api/ai?action=generateImage', {
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

    // Test 3: Unified AI API - YouTube Transcript
    await this.test('Unified AI API - YouTube Transcript', async () => {
      const response = await this.makeRequest('/api/ai?action=youtubeTranscript', {
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

    // Test 4: Unified AI API - Image Generation (Alternative)
    await this.test('Unified AI API - Image Generation (Alternative)', async () => {
      const response = await this.makeRequest('/api/ai?action=generateImage', {
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

    // Test 5: Unified AI API - Video Analysis
    await this.test('Unified AI API - Video Analysis', async () => {
      const response = await this.makeRequest('/api/ai?action=analyzeVideo', {
        videoUrl: 'https://www.youtube.com/watch?v=Mdcw3_IdYgE', // A video about AI in business
        prompt: 'Analyze this video for business opportunities and key takeaways.'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Video Analysis failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Video Analysis failed: ${result.error}`);
      }
      
      const analysisText = result.data?.text || '';
      if (analysisText.length < 50) {
        throw new Error('Video analysis result is too short or empty.');
      }
      
      const keywords = ['summary', 'insight', 'business', 'opportunity'];
      const hasKeywords = keywords.some(kw => analysisText.toLowerCase().includes(kw));
      if (!hasKeywords) {
        throw new Error('Video analysis result does not seem to contain a proper analysis.');
      }
    });

    // Test 6: Unified AI API - Code Execution
    await this.test('Unified AI API - Code Execution', async () => {
      const response = await this.makeRequest('/api/ai?action=executeCode', {
        prompt: 'What is the result of 15 * 24 / 3?'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Code Execution failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Code Execution failed: ${result.error}`);
      }
      
      const resultText = result.data?.text || '';
      if (!resultText.includes('120')) {
        throw new Error(`Code execution did not return the expected result. Got: "${resultText}"`);
      }
    });

    // Test 7: Unified AI API - Document Analysis
    await this.test('Unified AI API - Document Analysis', async () => {
      const documentContent = `
        Business Plan: AI-Powered Analytics Platform

        1. Executive Summary:
        This document outlines the business plan for a new SaaS platform that provides AI-powered business intelligence and analytics to small and medium-sized enterprises (SMEs).

        2. Market Opportunity:
        The SME market is underserved by current analytics solutions, which are often too complex and expensive. Our platform will offer an affordable, user-friendly alternative.

        3. Financial Projections:
        We project reaching $5M in ARR within three years, with a 20% profit margin.
      `;
      const documentData = Buffer.from(documentContent).toString('base64');
      
      const response = await this.makeRequest('/api/ai?action=analyzeDocument', {
        documentData,
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

    // Test 8: Unified AI API - URL Analysis
    await this.test('Unified AI API - URL Analysis', async () => {
      const response = await this.makeRequest('/api/ai?action=analyzeURL', {
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

    // Test 9: Error Handling - Invalid Action
    await this.test('Error Handling - Invalid Action', async () => {
      const response = await this.makeRequest('/api/ai?action=invalidAction', {
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

    // Test 10: Error Handling - Missing Prompt
    await this.test('Error Handling - Missing Prompt', async () => {
      const response = await this.makeRequest('/api/ai?action=conversationalFlow', {
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

    // Test 11: Rate Limiting Test
    await this.test('Rate Limiting - Multiple Requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        this.makeRequest('/api/ai?action=conversationalFlow', {
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

    // Test 12: Unified AI API - Webcam Analysis
    await this.test('Unified AI API - Webcam Analysis', async () => {
      // Create a simple 1x1 pixel image as base64
      const imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const response = await this.makeRequest('/api/ai?action=analyzeWebcamFrame', {
        imageData,
        analysisType: 'general'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Webcam Analysis failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Webcam Analysis failed: ${result.error}`);
      }
      
      const analysisText = result.data?.text || '';
      if (analysisText.length < 20) {
        throw new Error('Webcam analysis result is too short or empty.');
      }
    });

    // Test 13: Unified AI API - Screen Share Analysis
    await this.test('Unified AI API - Screen Share Analysis', async () => {
      // Create a simple 1x1 pixel image as base64
      const imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const response = await this.makeRequest('/api/ai?action=analyzeScreenShare', {
        imageData,
        context: 'Test screen capture'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Screen Share Analysis failed: ${error.error || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Screen Share Analysis failed: ${result.error}`);
      }
      
      const analysisText = result.data?.text || '';
      if (analysisText.length < 20) {
        throw new Error('Screen share analysis result is too short or empty.');
      }
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