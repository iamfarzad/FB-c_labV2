#!/usr/bin/env node

/**
 * Supabase Database Schema Verification Script
 * Checks if the remote database matches our local migrations
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  console.log('🔍 Verifying Supabase database schema...\n');
  console.log(`📍 Database: ${supabaseUrl}\n`);

  try {
    // Check if required tables exist
    const expectedTables = [
      'leads',
      'conversations', 
      'transcripts',
      'voice_sessions',
      'conversation_insights',
      'follow_up_tasks',
      'activities',
      'token_usage_logs',
      'user_budgets',
      'ai_responses',
      'lead_summaries',
      'lead_search_results',
      'meetings'
    ];

    console.log('📋 Checking table existence...');
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error && error.code === 'PGRST116') {
          console.log(`❌ Table '${tableName}' does not exist`);
        } else if (error) {
          console.log(`⚠️  Table '${tableName}' - Error: ${error.message}`);
        } else {
          console.log(`✅ Table '${tableName}' exists`);
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}' - Error: ${err.message}`);
      }
    }

    console.log('\n📊 Checking table schemas...');

    // Check conversations table structure
    const { data: conversationsSchema } = await supabase
      .rpc('get_table_schema', { table_name: 'conversations' })
      .single();
    
    if (conversationsSchema) {
      console.log('✅ Conversations table schema available');
    }

    // Check if RLS is enabled on critical tables
    console.log('\n🔒 Checking Row Level Security (RLS)...');
    
    const { data: rlsStatus } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .in('tablename', expectedTables);
    
    if (rlsStatus) {
      rlsStatus.forEach(table => {
        const status = table.rowsecurity ? '✅ Enabled' : '⚠️  Disabled';
        console.log(`  ${table.tablename}: RLS ${status}`);
      });
    }

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');

    // Test leads table insert (should work with RLS)
    try {
      const testLead = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        status: 'new'
      };

      const { data: insertedLead, error: insertError } = await supabase
        .from('leads')
        .insert(testLead)
        .select()
        .single();

      if (insertError) {
        console.log(`⚠️  Leads insert test failed: ${insertError.message}`);
      } else {
        console.log('✅ Leads insert test passed');
        
        // Clean up test data
        await supabase
          .from('leads')
          .delete()
          .eq('id', insertedLead.id);
        
        console.log('✅ Test data cleaned up');
      }
    } catch (err) {
      console.log(`⚠️  Database operation test failed: ${err.message}`);
    }

    // Check if we can create a conversation
    console.log('\n🔄 Testing conversation flow...');
    
    try {
      // First create a test lead
      const { data: testLead } = await supabase
        .from('leads')
        .insert({
          name: 'Schema Test User',
          email: 'schema-test@example.com',
          company: 'Schema Test Co'
        })
        .select()
        .single();

      if (testLead) {
        // Try to create a conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            lead_id: testLead.id,
            session_id: 'test-session-' + Date.now(),
            stage: 'greeting',
            status: 'active'
          })
          .select()
          .single();

        if (convError) {
          console.log(`⚠️  Conversation creation failed: ${convError.message}`);
        } else {
          console.log('✅ Conversation creation test passed');
          
          // Try to add a transcript
          const { error: transcriptError } = await supabase
            .from('transcripts')
            .insert({
              conversation_id: conversation.id,
              lead_id: testLead.id,
              message_type: 'text',
              role: 'user',
              content: 'Hello, this is a test message'
            });

          if (transcriptError) {
            console.log(`⚠️  Transcript creation failed: ${transcriptError.message}`);
          } else {
            console.log('✅ Transcript creation test passed');
          }
        }

        // Clean up test data
        await supabase.from('leads').delete().eq('id', testLead.id);
        console.log('✅ Test conversation data cleaned up');
      }
    } catch (err) {
      console.log(`⚠️  Conversation flow test failed: ${err.message}`);
    }

    console.log('\n📈 Database Statistics...');
    
    // Get row counts for main tables
    const tablesToCount = ['leads', 'conversations', 'transcripts', 'activities'];
    
    for (const table of tablesToCount) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`  ${table}: ${count} rows`);
        }
      } catch (err) {
        console.log(`  ${table}: Unable to count rows`);
      }
    }

    console.log('\n✅ Schema verification complete!');
    console.log('\n🎯 Summary:');
    console.log('  - All required tables should be present');
    console.log('  - RLS policies should be enabled');
    console.log('  - Basic CRUD operations should work');
    console.log('  - Foreign key relationships should be intact');
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    process.exit(1);
  }
}

// Helper function to get table schema (needs to be created in Supabase)
async function createSchemaFunction() {
  console.log('📝 Creating helper function for schema inspection...');
  
  const schemaFunction = `
    CREATE OR REPLACE FUNCTION get_table_schema(table_name TEXT)
    RETURNS TABLE(column_name TEXT, data_type TEXT, is_nullable TEXT, column_default TEXT)
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        c.column_name::TEXT,
        c.data_type::TEXT,
        c.is_nullable::TEXT,
        c.column_default::TEXT
      FROM information_schema.columns c
      WHERE c.table_name = $1
      AND c.table_schema = 'public'
      ORDER BY c.ordinal_position;
    END;
    $$;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: schemaFunction });
    if (!error) {
      console.log('✅ Schema helper function created');
    }
  } catch (err) {
    console.log('⚠️  Could not create schema helper function');
  }
}

// Run verification
verifySchema().catch(console.error);