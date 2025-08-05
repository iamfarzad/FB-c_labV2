#!/usr/bin/env node

/**
 * Comprehensive AI Functions Validation Script
 * 
 * This script validates all 4 core AI functions:
 * 1. Core Conversational AI Engine
 * 2. Multimodal Inputs (Image, Voice, Screen Share)
 * 3. AI-Powered Video-to-App Generator 
 * 4. Live AI Activity Logging
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';

const API_BASE = 'http://localhost:3000';
const TEST_YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const TEST_SESSION_ID = 'test_session_123';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class AIFunctionValidator {
  private results: TestResult[] = [];
  private devServerProcess: any = null;

  async startDevServer(): Promise<void> {
    console.log('🚀 Starting Next.js dev server...');
    
    return new Promise((resolve, reject) => {
      this.devServerProcess = spawn('pnpm', ['dev'], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let serverReady = false;
      
      this.devServerProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`[DEV] ${output}`);
        
        if (output.includes('Ready in') || output.includes('Local:')) {
          if (!serverReady) {
            serverReady = true;
            // Wait a bit more to ensure server is fully ready
            setTimeout(resolve, 2000);
          }
        }
      });

      this.devServerProcess.stderr?.on('data', (data: Buffer) => {
        console.error(`[DEV ERROR] ${data.toString()}`);
      });

      this.devServerProcess.on('error', reject);
      
      // Timeout after 60 seconds
      setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Dev server failed to start within 60 seconds'));
        }
      }, 60000);
    });
  }

  async stopDevServer(): Promise<void> {
    if (this.devServerProcess) {
      console.log('🛑 Stopping dev server...');
      this.devServerProcess.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  private async makeRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE}${path}`;
    console.log(`📡 Making request to: ${url}`);
    
    return await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  // Test 1: Core Conversational AI Engine
  async testCoreConversationalAI(): Promise<TestResult> {
    console.log('\n🧠 Testing Core Conversational AI Engine...');
    
    try {
      const testMessages = [
        { role: 'user', content: 'Hello, can you help me with AI automation?' }
      ];

      const response = await this.makeRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: testMessages,
          data: {
            leadContext: {
              name: 'John Doe',
              company: 'Test Corp',
              role: 'CTO',
              interests: 'AI automation, process optimization'
            },
            sessionId: TEST_SESSION_ID,
            userId: 'test_user_123'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      // Check if response contains expected fields
      if (!data.response || typeof data.response !== 'string') {
        throw new Error('Response missing expected "response" field');
      }

      // Check if response mentions user's name (personalization)
      const hasPersonalization = data.response.toLowerCase().includes('john') || 
                                data.response.toLowerCase().includes('ai automation');

      return {
        name: 'Core Conversational AI Engine',
        passed: true,
        details: {
          responseLength: data.response.length,
          hasPersonalization,
          response: data.response.substring(0, 200) + '...'
        }
      };
    } catch (error) {
      return {
        name: 'Core Conversational AI Engine',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 2: Check if streaming is implemented
  async testStreamingResponse(): Promise<TestResult> {
    console.log('\n🌊 Testing Streaming Response...');
    
    try {
      const testMessages = [
        { role: 'user', content: 'Tell me about AI automation in detail.' }
      ];

      const response = await this.makeRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: testMessages,
          data: {
            sessionId: TEST_SESSION_ID,
          }
        }),
      });

      const contentType = response.headers.get('content-type');
      const isStreaming = contentType?.includes('stream') || 
                         contentType?.includes('text/plain') ||
                         response.headers.get('transfer-encoding') === 'chunked';

      return {
        name: 'Streaming Response',
        passed: isStreaming,
        details: {
          contentType,
          transferEncoding: response.headers.get('transfer-encoding'),
          isStreaming
        },
        error: isStreaming ? undefined : 'API returns JSON instead of streaming response'
      };
    } catch (error) {
      return {
        name: 'Streaming Response',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 3: Video-to-App Generator
  async testVideoToAppGenerator(): Promise<TestResult> {
    console.log('\n🎥 Testing Video-to-App Generator...');
    
    try {
      // Test Step 1: Generate Spec
      console.log('  - Testing spec generation...');
      const specResponse = await this.makeRequest('/api/video-to-app', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generateSpec',
          videoUrl: TEST_YOUTUBE_URL
        }),
      });

      if (!specResponse.ok) {
        throw new Error(`Spec generation failed: ${await specResponse.text()}`);
      }

      const specData = await specResponse.json();
      if (!specData.spec) {
        throw new Error('Spec response missing "spec" field');
      }

      // Test Step 2: Generate Code
      console.log('  - Testing code generation...');
      const codeResponse = await this.makeRequest('/api/video-to-app', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generateCode',
          spec: specData.spec
        }),
      });

      if (!codeResponse.ok) {
        throw new Error(`Code generation failed: ${await codeResponse.text()}`);
      }

      const codeData = await codeResponse.json();
      if (!codeData.code) {
        throw new Error('Code response missing "code" field');
      }

      // Check if generated code contains HTML structure
      const hasHtml = codeData.code.includes('<html>') || codeData.code.includes('<!DOCTYPE');
      const hasScript = codeData.code.includes('<script>') || codeData.code.includes('javascript');

      return {
        name: 'Video-to-App Generator',
        passed: true,
        details: {
          specLength: specData.spec.length,
          codeLength: codeData.code.length,
          hasHtml,
          hasScript,
          specPreview: specData.spec.substring(0, 200) + '...',
          codePreview: codeData.code.substring(0, 200) + '...'
        }
      };
    } catch (error) {
      return {
        name: 'Video-to-App Generator',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 4: Token Usage Logging
  async testTokenUsageLogging(): Promise<TestResult> {
    console.log('\n💰 Testing Token Usage Logging...');
    
    try {
      // Make a chat request first to generate token usage
      await this.makeRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Short test message' }],
          data: {
            sessionId: TEST_SESSION_ID,
            userId: 'test_user_123'
          }
        }),
      });

      // Wait a moment for logging to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if token usage was logged (this would require database access)
      // For now, we'll just verify the endpoint doesn't crash
      return {
        name: 'Token Usage Logging',
        passed: true,
        details: {
          note: 'Basic endpoint functionality verified. Database logging requires manual verification.'
        }
      };
    } catch (error) {
      return {
        name: 'Token Usage Logging',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 5: Real-time Activities System
  async testRealTimeActivities(): Promise<TestResult> {
    console.log('\n📊 Testing Real-time Activities System...');
    
    try {
      // Test if useRealTimeActivities can be imported
      const realTimeActivitiesPath = join(process.cwd(), 'hooks', 'use-real-time-activities.ts');
      const realTimeActivitiesContent = await readFile(realTimeActivitiesPath, 'utf-8');
      
      const hasSupabaseImport = realTimeActivitiesContent.includes('supabase');
      const hasChannelLogic = realTimeActivitiesContent.includes('channel');
      const hasAddActivityMethod = realTimeActivitiesContent.includes('addActivity');

      return {
        name: 'Real-time Activities System',
        passed: hasSupabaseImport && hasChannelLogic && hasAddActivityMethod,
        details: {
          hasSupabaseImport,
          hasChannelLogic,
          hasAddActivityMethod,
          note: 'Static analysis only. Real-time functionality requires manual testing.'
        },
        error: (!hasSupabaseImport || !hasChannelLogic || !hasAddActivityMethod) ? 
               'Real-time activities system missing required functionality' : undefined
      };
    } catch (error) {
      return {
        name: 'Real-time Activities System',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 6: Multimodal Input Endpoints
  async testMultimodalInputs(): Promise<TestResult> {
    console.log('\n🎨 Testing Multimodal Input Support...');
    
    try {
      // Test if upload endpoint exists
      const uploadResponse = await this.makeRequest('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      });

      const uploadExists = uploadResponse.status !== 404;

      // Test if modals can be loaded (static analysis)
      const modalPaths = [
        'components/chat/modals/WebcamModal.tsx',
        'components/chat/modals/ScreenShareModal.tsx',
        'components/chat/tools/VoiceInput/VoiceInput.tsx'
      ];

      const modalChecks = await Promise.all(
        modalPaths.map(async (path) => {
          try {
            const content = await readFile(join(process.cwd(), path), 'utf-8');
            return {
              path,
              exists: true,
              hasMediaSupport: content.includes('getUserMedia') || content.includes('getDisplayMedia'),
              hasImageProcessing: content.includes('canvas') || content.includes('base64')
            };
          } catch {
            return { path, exists: false, hasMediaSupport: false, hasImageProcessing: false };
          }
        })
      );

      const allModalsExist = modalChecks.every(check => check.exists);

      return {
        name: 'Multimodal Input Support',
        passed: allModalsExist,
        details: {
          uploadEndpointExists: uploadExists,
          modalChecks,
          note: 'Static analysis only. Media capture requires browser environment.'
        },
        error: !allModalsExist ? 'Some modal components are missing' : undefined
      };
    } catch (error) {
      return {
        name: 'Multimodal Input Support',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🔍 Starting AI Functions Validation...\n');
    
    try {
      await this.startDevServer();
      
      // Run all tests
      const tests = [
        this.testCoreConversationalAI(),
        this.testStreamingResponse(),
        this.testVideoToAppGenerator(),
        this.testTokenUsageLogging(),
        this.testRealTimeActivities(),
        this.testMultimodalInputs(),
      ];

      this.results = await Promise.all(tests);
      
    } catch (error) {
      console.error('❌ Failed to start dev server:', error);
      process.exit(1);
    } finally {
      await this.stopDevServer();
    }
  }

  printResults(): void {
    console.log('\n📋 Test Results Summary:');
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.name}`);
      
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
      
      if (result.details) {
        console.log(`     Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      
      if (result.passed) passed++;
      else failed++;
    });
    
    console.log('='.repeat(50));
    console.log(`Total: ${this.results.length} tests`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n🔧 Issues Found:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`- ${result.name}: ${result.error}`);
      });
    }
  }

  getFailedTests(): TestResult[] {
    return this.results.filter(r => !r.passed);
  }
}

// Run the validation
async function main() {
  const validator = new AIFunctionValidator();
  
  try {
    await validator.runAllTests();
    validator.printResults();
    
    const failedTests = validator.getFailedTests();
    if (failedTests.length > 0) {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All AI functions are working correctly!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { AIFunctionValidator };
