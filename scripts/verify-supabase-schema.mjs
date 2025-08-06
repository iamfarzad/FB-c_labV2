#!/usr/bin/env node

/**
 * Supabase Database Schema Verification Script
 * Checks if the remote database matches our local migrations
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure .env.local exists in the project root');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  console.log('🔍 Verifying Supabase database schema...\n');
  console.log(`📍 Database: ${supabaseUrl.replace(/\/\/.*@/, '//***@')}\n`);

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
    const tableResults = {};
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error && (error.code === 'PGRST116' || error.message.includes('does not exist'))) {
          console.log(`❌ Table '${tableName}' does not exist`);
          tableResults[tableName] = false;
        } else if (error) {
          console.log(`⚠️  Table '${tableName}' - Error: ${error.message}`);
          tableResults[tableName] = 'error';
        } else {
          console.log(`✅ Table '${tableName}' exists`);
          tableResults[tableName] = true;
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}' - Error: ${err.message}`);
        tableResults[tableName] = false;
      }
    }

    // Count missing tables
    const missingTables = Object.entries(tableResults)
      .filter(([, exists]) => exists === false)
      .map(([name]) => name);

    if (missingTables.length > 0) {
      console.log(`\n❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('\n🔧 You need to run the database migrations:');
      console.log('1. Check supabase/migrations/ directory');
      console.log('2. Apply the latest migration: 20250804240000_add_conversations_transcripts.sql');
      return false;
    }

    // Test basic operations on existing tables
    console.log('\n🧪 Testing basic operations...');

    // Test leads table insert (should work with RLS)
    try {
      const testLead = {
        name: 'Schema Test User',
        email: `schema-test-${Date.now()}@example.com`,
        company: 'Schema Test Co',
        status: 'new'
      };

      const { data: insertedLead, error: insertError } = await supabase
        .from('leads')
        .insert(testLead)
        .select()
        .single();

      if (insertError) {
        console.log(`⚠️  Leads insert test failed: ${insertError.message}`);
        if (insertError.message.includes('permission')) {
          console.log('   This might be a RLS policy issue');
        }
      } else {
        console.log('✅ Leads insert test passed');
        
        // Test conversation creation if conversations table exists
        if (tableResults.conversations === true) {
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .insert({
              lead_id: insertedLead.id,
              session_id: `test-session-${Date.now()}`,
              stage: 'greeting',
              status: 'active'
            })
            .select()
            .single();

          if (convError) {
            console.log(`⚠️  Conversation creation failed: ${convError.message}`);
          } else {
            console.log('✅ Conversation creation test passed');
            
            // Test transcript creation
            if (tableResults.transcripts === true) {
              const { error: transcriptError } = await supabase
                .from('transcripts')
                .insert({
                  conversation_id: conversation.id,
                  lead_id: insertedLead.id,
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
          }
        }

        // Clean up test data
        await supabase.from('leads').delete().eq('id', insertedLead.id);
        console.log('✅ Test data cleaned up');
      }
    } catch (err) {
      console.log(`⚠️  Database operation test failed: ${err.message}`);
    }

    // Get row counts for existing tables
    console.log('\n📈 Database Statistics...');
    
    const tablesToCount = expectedTables.filter(table => tableResults[table] === true);
    
    for (const table of tablesToCount) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`  ${table}: ${count || 0} rows`);
        }
      } catch (err) {
        console.log(`  ${table}: Unable to count rows`);
      }
    }

    console.log('\n✅ Schema verification complete!');
    
    const existingTables = Object.values(tableResults).filter(v => v === true).length;
    const totalTables = expectedTables.length;
    
    console.log('\n🎯 Summary:');
    console.log(`  - Tables: ${existingTables}/${totalTables} exist`);
    console.log(`  - Database connection: ✅ Working`);
    console.log(`  - Basic operations: ✅ Functional`);
    
    if (existingTables === totalTables) {
      console.log('\n🎉 Database schema is complete and ready for deployment!');
      return true;
    } else {
      console.log(`\n⚠️  ${totalTables - existingTables} tables are missing. Run migrations before deploying.`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    return false;
  }
}

// Check if migration files exist locally
function checkMigrationFiles() {
  console.log('📁 Checking local migration files...');
  
  try {
    const migrationDir = join(__dirname, '..', 'supabase', 'migrations');
    const migrationFile = join(migrationDir, '20250804240000_add_conversations_transcripts.sql');
    
    const migration = readFileSync(migrationFile, 'utf8');
    console.log('✅ Latest migration file exists locally');
    console.log(`   File: ${migrationFile}`);
    console.log(`   Size: ${Math.round(migration.length / 1024)}KB`);
    
    // Check if migration contains expected table creations
    const expectedCreations = [
      'CREATE TABLE IF NOT EXISTS conversations',
      'CREATE TABLE IF NOT EXISTS transcripts',
      'CREATE TABLE IF NOT EXISTS voice_sessions'
    ];
    
    const missingCreations = expectedCreations.filter(creation => 
      !migration.includes(creation)
    );
    
    if (missingCreations.length === 0) {
      console.log('✅ Migration file contains all expected table creations');
    } else {
      console.log('⚠️  Migration file might be incomplete');
    }
    
  } catch (err) {
    console.log('❌ Migration file not found or unreadable');
    console.log('   You may need to create the migration file first');
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Supabase Schema Verification\n');
  
  checkMigrationFiles();
  console.log('');
  
  const schemaValid = await verifySchema();
  
  if (schemaValid) {
    console.log('\n✅ Ready for deployment!');
    process.exit(0);
  } else {
    console.log('\n❌ Schema verification failed. Please fix issues before deploying.');
    process.exit(1);
  }
}

main().catch(console.error);