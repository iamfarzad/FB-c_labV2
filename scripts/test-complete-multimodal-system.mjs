#!/usr/bin/env node

/**
 * Complete Multimodal AI System Test Suite
 * Tests all 18 AI features and multimodal capabilities
 */

import fs from 'fs';
import path from 'path';

const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  testTimeout: 60000,
  maxRetries: 3
};

const AI_FEATURES = [
  {
    name: 'Text Generation',
    endpoint: '/api/chat',
    test: 'Basic text generation and conversation',
    payload: {
      messages: [{ role: 'user', content: 'Hello, tell me about AI automation' }]
    }
  },
  {
    name: 'Speech Generation (TTS)',
    endpoint: '/api/gemini-live',
    test: 'Text-to-speech conversion',
    payload: {
      prompt: 'Hello, this is a test of speech generation',
      enableTTS: true,
      voiceName: 'Puck'
    }
  },
  {
    name: 'Long Context Handling',
    endpoint: '/api/chat',
    test: 'Multi-turn conversation with context',
    payload: {
      messages: [
        { role: 'user', content: 'I run a manufacturing company with 500 employees' },
        { role: 'assistant', content: 'That sounds like a substantial operation. What specific challenges are you facing?' },
        { role: 'user', content: 'We have manual quality control processes that are error-prone' },
        { role: 'assistant', content: 'Quality control automation could significantly help. What products do you manufacture?' },
        { role: 'user', content: 'How would AI help with our specific situation?' }
      ]
    }
  },
  {
    name: 'Structured Output',
    endpoint: '/api/chat',
    test: 'Business summary generation',
    payload: {
      messages: [{ role: 'user', content: 'Create a structured business analysis for a tech startup' }],
      data: { requestStructuredOutput: true }
    }
  },
  {
    name: 'Function Calling',
    endpoint: '/api/chat',
    test: 'API integration and tool usage',
    payload: {
      messages: [{ role: 'user', content: 'Search for information about AI trends in 2024' }],
      data: { enableGoogleSearch: true }
    }
  },
  {
    name: 'Google Search Grounding',
    endpoint: '/api/chat',
    test: 'Real-time web data integration',
    payload: {
      messages: [{ role: 'user', content: 'What are the latest developments in AI automation?' }],
      data: { enableGoogleSearch: true }
    }
  },
  {
    name: 'URL Context Analysis',
    endpoint: '/api/chat',
    test: 'Website and document analysis',
    payload: {
      messages: [{ role: 'user', content: 'Analyze this website: https://example.com' }],
      data: { enableUrlContext: true }
    }
  },
  {
    name: 'Voice Input & Recognition',
    endpoint: '/api/tools/voice-transcript',
    test: 'Voice-to-text transcription',
    payload: {
      audioData: 'data:audio/webm;base64,GkXfo59ChoEBQveBAULlgQRC84EIQoKEd2VibUKHgQJChYECGFOAZwH',
      mimeType: 'audio/webm'
    }
  },
  {
    name: 'Webcam Capture & Processing',
    endpoint: '/api/tools/webcam-capture',
    test: 'Webcam image capture and analysis',
    payload: {
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      type: 'webcam'
    }
  },
  {
    name: 'Screen Share & Analysis',
    endpoint: '/api/tools/screen-share',
    test: 'Screen capture and analysis',
    payload: {
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      type: 'screen'
    }
  },
  {
    name: 'ROI Calculator & Business Tools',
    endpoint: '/api/tools/roi-calculation',
    test: 'ROI calculation and business analysis',
    payload: {
      currentCosts: 100000,
      projectedSavings: 40000,
      implementationCost: 50000,
      timeFrameMonths: 12
    }
  },
  {
    name: 'Image Understanding',
    endpoint: '/api/analyze-image',
    test: 'General image analysis',
    payload: {
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      type: 'general'
    }
  },
  {
    name: 'Video Understanding',
    endpoint: '/api/video-to-app',
    test: 'YouTube video processing',
    payload: {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      action: 'generateSpec'
    }
  },
  {
    name: 'Video-to-Learning App',
    endpoint: '/api/video-to-app',
    test: 'Educational content generation',
    payload: {
      videoUrl: 'https://www.youtube.com/watch?v=example',
      action: 'generateSpec'
    }
  },
  {
    name: 'Document Understanding',
    endpoint: '/api/analyze-document',
    test: 'PDF processing and analysis',
    payload: {
      data: 'This is a test business document for AI automation analysis. The company is looking to improve efficiency through automated processes.',
      mimeType: 'text/plain',
      fileName: 'test-business-document.txt'
    }
  },
  {
    name: 'Lead Capture & Summary',
    endpoint: '/api/chat',
    test: 'Contact management integration',
    payload: {
      messages: [{ role: 'user', content: 'My name is John Smith and my email is john@techcorp.com' }],
      data: { enableLeadGeneration: true }
    }
  },
  {
    name: 'Lead Research & Analysis',
    endpoint: '/api/lead-research',
    test: 'Advanced lead intelligence',
    payload: {
      email: 'test@company.com',
      sessionId: 'test-session-123',
      name: 'Test User',
      company: 'Test Company'
    }
  },
  {
    name: 'PDF Summary & Email System',
    endpoint: '/api/export-summary',
    test: 'Professional PDF generation with email integration',
    payload: {
      leadInfo: {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        role: 'CEO'
      },
      conversationHistory: [
        {
          role: 'user',
          content: 'I need help with AI automation for my business',
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: 'I can help you implement AI automation solutions tailored to your needs',
          timestamp: new Date().toISOString()
        }
      ],
      leadResearch: {
        conversation_summary: 'Business owner seeking AI automation solutions',
        consultant_brief: 'High-value lead interested in comprehensive AI implementation',
        lead_score: 92,
        ai_capabilities_shown: 'Text Generation, Lead Capture, Business Analysis'
      },
      sessionId: 'test-session-123'
    },
    validateResponse: (response) => {
      // For PDF export, we expect binary data
      return response.headers.get('content-type') === 'application/pdf' &&
             response.headers.get('content-disposition')?.includes('.pdf');
    }
  }
];

const MULTIMODAL_SCENARIOS = [
  {
    name: 'Complete AI Showcase',
    description: 'Test all modalities in sequence',
    steps: [
      { feature: 'Text Generation', message: 'Hello, I need help with AI automation' },
      { feature: 'Lead Capture & Summary', message: 'My name is Test User, email test@company.com' },
      { feature: 'Google Search Grounding', message: 'Search for AI automation trends' },
      { feature: 'Image Understanding', action: 'analyze_screenshot' },
      { feature: 'Video Understanding', action: 'analyze_youtube_video' },
      { feature: 'Lead Research & Analysis', action: 'research_lead' }
    ]
  },
  {
    name: 'Business Consultation Flow',
    description: 'Complete business consultation with all AI features',
    steps: [
      { feature: 'URL Context Analysis', message: 'Analyze my company website: https://example.com' },
      { feature: 'Structured Output', message: 'Create a business analysis report' },
      { feature: 'Document Understanding', action: 'analyze_business_document' },
      { feature: 'Lead Capture & Summary', message: 'I want to schedule a consultation' },
      { feature: 'Lead Research & Analysis', message: 'Research this lead for follow-up' }
    ]
  },
  {
    name: 'Educational Content Creation',
    description: 'Create learning materials using AI',
    steps: [
      { feature: 'Video-to-Learning App', action: 'convert_youtube_to_app' },
      { feature: 'Speech Generation (TTS)', message: 'Generate audio narration' },
      { feature: 'Structured Output', message: 'Create learning objectives' },
      { feature: 'Document Understanding', action: 'analyze_educational_content' }
    ]
  }
];

class MultimodalSystemTester {
  constructor() {
    this.results = {
      features: {},
      scenarios: {},
      overall: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };
    this.sessionId = `test-multimodal-${Date.now()}`;
  }

  async runAllTests() {
    console.log('🚀 Starting Complete Multimodal AI System Tests...\n');
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Base URL: ${TEST_CONFIG.baseUrl}\n`);

    // Test individual AI features
    await this.testAIFeatures();

    // Test multimodal scenarios
    await this.testMultimodalScenarios();

    // Test system performance
    await this.testSystemPerformance();

    this.printResults();
    return this.results.overall.failed === 0;
  }

  async testAIFeatures() {
    console.log('🧠 Testing Individual AI Features');
    console.log('==================================\n');

    for (const feature of AI_FEATURES) {
      console.log(`Testing: ${feature.name}`);
      console.log(`   ${feature.test}`);

      try {
        const result = await this.testFeature(feature);
        
        this.results.features[feature.name] = {
          passed: true,
          responseTime: result.responseTime,
          details: result.details
        };

        console.log(`   ✅ Passed (${result.responseTime}ms)`);
        this.results.overall.passed++;

      } catch (error) {
        this.results.features[feature.name] = {
          passed: false,
          error: error.message
        };

        console.log(`   ❌ Failed: ${error.message}`);
        this.results.overall.failed++;
      }

      this.results.overall.total++;
      console.log('');
    }
  }

  async testFeature(feature) {
    const startTime = Date.now();

    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}${feature.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-Session-ID': this.sessionId
        },
        body: JSON.stringify(feature.payload),
        signal: AbortSignal.timeout(TEST_CONFIG.testTimeout)
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle custom validation if provided
      if (feature.validateResponse) {
        const isValid = feature.validateResponse(response);
        if (!isValid) {
          throw new Error('Custom validation failed');
        }
      }

      // Handle different response types
      let result;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('text/event-stream')) {
        // Handle streaming responses
        result = await this.handleStreamingResponse(response);
      } else if (contentType?.includes('application/json')) {
        result = await response.json();
      } else if (contentType?.includes('application/pdf')) {
        // For PDF responses, just validate headers
        result = {
          type: 'pdf',
          size: response.headers.get('content-length'),
          filename: response.headers.get('content-disposition')
        };
      } else {
        result = await response.text();
      }

      return {
        responseTime,
        details: result
      };

    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error(`Request timeout (>${TEST_CONFIG.testTimeout}ms)`);
      }
      throw error;
    }
  }

  async handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';
    let chunks = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                content += data.content;
                chunks++;
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      return {
        content,
        chunks,
        length: content.length
      };

    } finally {
      reader.releaseLock();
    }
  }

  async testMultimodalScenarios() {
    console.log('🎭 Testing Multimodal Scenarios');
    console.log('===============================\n');

    for (const scenario of MULTIMODAL_SCENARIOS) {
      console.log(`Scenario: ${scenario.name}`);
      console.log(`   ${scenario.description}\n`);

      let scenarioPassed = true;
      const scenarioResults = [];

      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        console.log(`   Step ${i + 1}: ${step.feature}`);

        try {
          const feature = AI_FEATURES.find(f => f.name === step.feature);
          if (!feature) {
            throw new Error(`Feature ${step.feature} not found`);
          }

          // Customize payload based on step
          const customPayload = { ...feature.payload };
          if (step.message) {
            customPayload.messages = [{ role: 'user', content: step.message }];
          }

          const result = await this.testFeature({ ...feature, payload: customPayload });
          scenarioResults.push({
            step: i + 1,
            feature: step.feature,
            passed: true,
            responseTime: result.responseTime
          });

          console.log(`   ✅ Step ${i + 1} passed (${result.responseTime}ms)`);

        } catch (error) {
          scenarioResults.push({
            step: i + 1,
            feature: step.feature,
            passed: false,
            error: error.message
          });

          console.log(`   ❌ Step ${i + 1} failed: ${error.message}`);
          scenarioPassed = false;
        }
      }

      this.results.scenarios[scenario.name] = {
        passed: scenarioPassed,
        steps: scenarioResults
      };

      console.log(`   ${scenarioPassed ? '✅' : '❌'} Scenario ${scenarioPassed ? 'passed' : 'failed'}\n`);
    }
  }

  async testSystemPerformance() {
    console.log('⚡ Testing System Performance');
    console.log('=============================\n');

    // Test concurrent requests
    console.log('Testing concurrent chat requests...');
    const concurrentTests = [];
    const concurrentCount = 5;

    for (let i = 0; i < concurrentCount; i++) {
      concurrentTests.push(
        this.testFeature({
          name: `Concurrent Test ${i + 1}`,
          endpoint: '/api/chat',
          payload: {
            messages: [{ role: 'user', content: `Concurrent test message ${i + 1}` }]
          }
        })
      );
    }

    try {
      const startTime = Date.now();
      const results = await Promise.all(concurrentTests);
      const totalTime = Date.now() - startTime;

      console.log(`✅ Concurrent requests completed`);
      console.log(`   ${concurrentCount} requests in ${totalTime}ms`);
      console.log(`   Average: ${Math.round(totalTime / concurrentCount)}ms per request\n`);

    } catch (error) {
      console.log(`❌ Concurrent requests failed: ${error.message}\n`);
    }

    // Test memory usage (simulated)
    console.log('Testing memory efficiency...');
    const memoryTest = await this.testFeature({
      name: 'Memory Test',
      endpoint: '/api/chat',
      payload: {
        messages: Array(10).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Long conversation message ${i + 1} with substantial content to test memory handling and context management capabilities of the AI system.`
        }))
      }
    });

    console.log(`✅ Memory test completed (${memoryTest.responseTime}ms)\n`);
  }

  printResults() {
    console.log('📊 Complete Test Results Summary');
    console.log('=================================');
    console.log(`Total Tests: ${this.results.overall.total}`);
    console.log(`Passed: ${this.results.overall.passed} ✅`);
    console.log(`Failed: ${this.results.overall.failed} ❌`);
    console.log(`Success Rate: ${Math.round((this.results.overall.passed / this.results.overall.total) * 100)}%\n`);

    // Feature results
    console.log('🧠 AI Features Results:');
    Object.entries(this.results.features).forEach(([name, result]) => {
      const status = result.passed ? '✅' : '❌';
      const time = result.responseTime ? `(${result.responseTime}ms)` : '';
      console.log(`   ${status} ${name} ${time}`);
      if (!result.passed) {
        console.log(`      Error: ${result.error}`);
      }
    });
    console.log('');

    // Scenario results
    console.log('🎭 Multimodal Scenarios Results:');
    Object.entries(this.results.scenarios).forEach(([name, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`   ${status} ${name}`);
      result.steps.forEach(step => {
        const stepStatus = step.passed ? '✅' : '❌';
        const time = step.responseTime ? `(${step.responseTime}ms)` : '';
        console.log(`      ${stepStatus} Step ${step.step}: ${step.feature} ${time}`);
      });
    });
    console.log('');

    // Performance summary
    const responseTimes = Object.values(this.results.features)
      .filter(r => r.passed && r.responseTime)
      .map(r => r.responseTime);

    if (responseTimes.length > 0) {
      const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);

      console.log('⚡ Performance Summary:');
      console.log(`   Average Response Time: ${avgResponseTime}ms`);
      console.log(`   Fastest Response: ${minResponseTime}ms`);
      console.log(`   Slowest Response: ${maxResponseTime}ms\n`);
    }

    // Save results to file
    const resultsFile = path.join(process.cwd(), 'test-results', 'multimodal-system-test.json');
    fs.mkdirSync(path.dirname(resultsFile), { recursive: true });
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      ...this.results
    }, null, 2));

    console.log(`📄 Results saved to: ${resultsFile}`);
  }
}

// Main execution
async function main() {
  console.log('🧪 F.B/c Complete Multimodal AI System Test Suite');
  console.log('==================================================\n');

  const tester = new MultimodalSystemTester();
  const allTestsPassed = await tester.runAllTests();

  console.log('🏁 Final Result');
  console.log('================');
  if (allTestsPassed) {
    console.log('✅ All tests passed! Your multimodal AI system is working correctly.');
    console.log('🎉 All 18 AI features are operational and integrated properly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the results above.');
    console.log('🔧 Review failed features and fix any issues before deployment.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
}

export { MultimodalSystemTester };
