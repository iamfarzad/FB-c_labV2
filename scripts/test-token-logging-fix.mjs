#!/usr/bin/env node

/**
 * Test script to validate the token logging fix
 * Tests that total_tokens is correctly calculated as a generated column
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTokenLoggingFix() {
  console.log('🧪 Testing token logging fix - Generated column validation\n');

  try {
    // Test 1: Insert without total_tokens (should work)
    console.log('Test 1: Inserting token usage without total_tokens...');
    const testData = {
      session_id: 'test-fix-' + Date.now(),
      model: 'gemini-1.5-flash',
      input_tokens: 150,
      output_tokens: 75,
      // Note: NOT setting total_tokens - it should be calculated automatically
      estimated_cost: 0.0015,
      task_type: 'chat',
      endpoint: '/api/chat',
      success: true,
      created_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('token_usage_logs')
      .insert(testData)
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return false;
    }

    console.log('✅ Insert successful');
    console.log('📊 Generated data:', {
      id: insertData.id,
      input_tokens: insertData.input_tokens,
      output_tokens: insertData.output_tokens,
      total_tokens: insertData.total_tokens,
      calculated_correctly: insertData.total_tokens === (insertData.input_tokens + insertData.output_tokens)
    });

    // Verify total_tokens is calculated correctly
    if (insertData.total_tokens !== (insertData.input_tokens + insertData.output_tokens)) {
      console.error('❌ total_tokens calculation is incorrect');
      console.error(`Expected: ${insertData.input_tokens + insertData.output_tokens}, Got: ${insertData.total_tokens}`);
      return false;
    }

    console.log('✅ total_tokens calculated correctly as generated column\n');

    // Test 2: Try to insert WITH total_tokens (should fail)
    console.log('Test 2: Attempting to insert WITH total_tokens (should fail)...');
    const badTestData = {
      ...testData,
      session_id: 'test-fix-bad-' + Date.now(),
      total_tokens: 999 // This should cause an error
    };

    const { error: badInsertError } = await supabase
      .from('token_usage_logs')
      .insert(badTestData);

    if (badInsertError) {
      console.log('✅ Insert correctly failed when trying to set total_tokens');
      console.log('📝 Error message:', badInsertError.message);
      
      // Check if it's the expected error
      if (badInsertError.message.includes('cannot insert') && badInsertError.message.includes('total_tokens')) {
        console.log('✅ Got expected generated column error');
      }
    } else {
      console.error('❌ Insert should have failed but didn\'t');
      return false;
    }

    // Test 3: Test multiple inserts to verify consistency
    console.log('\nTest 3: Testing multiple inserts for consistency...');
    const multipleTests = [
      { input_tokens: 100, output_tokens: 50 },
      { input_tokens: 200, output_tokens: 100 },
      { input_tokens: 75, output_tokens: 25 }
    ];

    for (let i = 0; i < multipleTests.length; i++) {
      const testCase = multipleTests[i];
      const { data, error } = await supabase
        .from('token_usage_logs')
        .insert({
          session_id: `test-multi-${Date.now()}-${i}`,
          model: 'gemini-1.5-flash',
          input_tokens: testCase.input_tokens,
          output_tokens: testCase.output_tokens,
          estimated_cost: 0.001,
          task_type: 'test',
          endpoint: '/api/test',
          success: true
        })
        .select('input_tokens, output_tokens, total_tokens')
        .single();

      if (error) {
        console.error(`❌ Multiple insert test ${i + 1} failed:`, error.message);
        return false;
      }

      const expectedTotal = testCase.input_tokens + testCase.output_tokens;
      if (data.total_tokens !== expectedTotal) {
        console.error(`❌ Test ${i + 1} calculation wrong. Expected: ${expectedTotal}, Got: ${data.total_tokens}`);
        return false;
      }

      console.log(`✅ Test ${i + 1}: ${data.input_tokens} + ${data.output_tokens} = ${data.total_tokens}`);
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('token_usage_logs')
      .delete()
      .like('session_id', 'test-%');

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All token logging fix tests passed!');
    console.log('📝 Summary:');
    console.log('  - Generated column working correctly');
    console.log('  - Manual total_tokens insertion properly blocked');
    console.log('  - Multiple calculations consistent');
    console.log('  - Database automatically ensures accuracy');
    
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Test the token usage logger function
async function testTokenUsageLoggerFunction() {
  console.log('\n🧪 Testing TokenUsageLogger class...\n');

  try {
    // Dynamic import for ES modules
    const { TokenUsageLogger } = await import('../lib/token-usage-logger.ts');
    const logger = TokenUsageLogger.getInstance();

    // Test logging without total_tokens
    await logger.logTokenUsage({
      session_id: 'test-logger-' + Date.now(),
      feature: 'test',
      model: 'gemini-1.5-flash',
      input_tokens: 300,
      output_tokens: 150,
      // total_tokens: 450, // This should be ignored even if provided
      estimated_cost: 0.003,
      success: true
    });

    console.log('✅ TokenUsageLogger.logTokenUsage() works correctly');
    
    // Test the convenience function
    const { logTokenUsage } = await import('../lib/token-usage-logger.ts');
    
    await logTokenUsage({
      session_id: 'test-convenience-' + Date.now(),
      feature: 'test-convenience',
      model: 'gemini-1.5-flash',
      input_tokens: 400,
      output_tokens: 200,
      estimated_cost: 0.004,
      success: true
    });

    console.log('✅ Convenience logTokenUsage() function works correctly');
    
    return true;

  } catch (error) {
    console.error('❌ TokenUsageLogger test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting comprehensive token logging fix validation...\n');

  const test1Passed = await testTokenLoggingFix();
  const test2Passed = await testTokenUsageLoggerFunction();

  console.log('\n📊 Final Results:');
  console.log(`Database Tests: ${test1Passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Logger Tests: ${test2Passed ? '✅ PASSED' : '❌ FAILED'}`);

  if (test1Passed && test2Passed) {
    console.log('\n🎉 ALL TESTS PASSED! Token logging fix is working correctly.');
    console.log('🔧 The error "cannot insert a non-DEFAULT value into column total_tokens" is now resolved.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

main().catch(console.error);
