#!/usr/bin/env node

/**
 * Apply Supabase Migration Script
 * Applies the latest migration directly to the remote database
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔄 Applying Supabase migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250804240000_add_conversations_transcripts.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log(`📁 Reading migration: ${migrationPath}`);
    console.log(`📊 Migration size: ${Math.round(migrationSQL.length / 1024)}KB\n`);
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} SQL statements...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and empty statements
      if (statement.trim() === ';' || statement.startsWith('--')) {
        continue;
      }
      
      try {
        console.log(`${i + 1}/${statements.length}: Executing...`);
        
        // For CREATE TABLE statements, show table name
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE[^(]*([a-zA-Z_]+)/)?.[1];
          if (tableName) {
            console.log(`   Creating table: ${tableName}`);
          }
        }
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        });
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
        
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Migration Results:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration applied successfully!');
      
      // Verify the tables were created
      console.log('\n🔍 Verifying created tables...');
      const newTables = ['voice_sessions', 'conversation_insights', 'follow_up_tasks'];
      
      for (const tableName of newTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`   ❌ Table '${tableName}' verification failed: ${error.message}`);
          } else {
            console.log(`   ✅ Table '${tableName}' created successfully`);
          }
        } catch (err) {
          console.log(`   ❌ Table '${tableName}' verification error: ${err.message}`);
        }
      }
      
      return true;
    } else {
      console.log('\n⚠️  Migration completed with errors. Please check the output above.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

// Check if we can execute SQL (need to create the function first)
async function setupSQLExecution() {
  console.log('🔧 Setting up SQL execution capability...\n');
  
  try {
    // Try to create the exec_sql function if it doesn't exist
    const execSqlFunction = `
      CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    // We'll execute this manually since we can't use exec_sql to create itself
    console.log('⚠️  Note: You may need to create the exec_sql function manually in Supabase SQL Editor:');
    console.log('');
    console.log(execSqlFunction);
    console.log('');
    console.log('Or run the migration manually by copying the SQL from:');
    console.log('supabase/migrations/20250804240000_add_conversations_transcripts.sql');
    console.log('');
    
    return false; // Indicate manual intervention needed
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

// Alternative: Apply migration by executing individual CREATE statements
async function applyMigrationDirect() {
  console.log('🔄 Applying migration using direct SQL execution...\n');
  
  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250804240000_add_conversations_transcripts.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Extract CREATE TABLE statements
    const createTableRegex = /CREATE TABLE[^;]+;/g;
    const createStatements = migrationSQL.match(createTableRegex) || [];
    
    console.log(`Found ${createStatements.length} CREATE TABLE statements`);
    
    for (const statement of createStatements) {
      const tableName = statement.match(/CREATE TABLE[^(]*([a-zA-Z_]+)/)?.[1];
      console.log(`\nCreating table: ${tableName}`);
      console.log('SQL to execute in Supabase SQL Editor:');
      console.log('---');
      console.log(statement);
      console.log('---');
    }
    
    console.log('\n📝 Manual Steps Required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the CREATE TABLE statements above');
    console.log('4. Execute each statement');
    console.log('5. Run the verification script again');
    
    return false;
    
  } catch (error) {
    console.error('❌ Failed to read migration:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Supabase Migration Application\n');
  
  // Check if we can execute SQL directly
  const canExecute = await setupSQLExecution();
  
  if (canExecute) {
    const success = await applyMigration();
    process.exit(success ? 0 : 1);
  } else {
    console.log('📋 Providing manual migration instructions...\n');
    await applyMigrationDirect();
    process.exit(1); // Exit with code 1 to indicate manual steps needed
  }
}

main().catch(console.error);