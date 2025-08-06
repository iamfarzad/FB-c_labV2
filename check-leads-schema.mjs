#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLeadsSchema() {
  console.log('🔍 Checking actual leads table structure...\n');
  
  try {
    // Try to get table structure using information_schema
    const { data: columns, error } = await supabase
      .rpc('sql', { 
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'leads' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (error) {
      console.log('⚠️  Could not query schema directly, trying alternative method...');
      
      // Alternative: Try to select from leads with limit 0 to see structure
      const { data, error: selectError } = await supabase
        .from('leads')
        .select('*')
        .limit(0);
        
      if (selectError) {
        console.log('❌ Error accessing leads table:', selectError.message);
        console.log('\n🔧 Suggested fix: Recreate the leads table with proper schema');
        
        console.log('\nRun this SQL in Supabase SQL Editor:');
        console.log('---');
        console.log(`
DROP TABLE IF EXISTS leads CASCADE;

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT,
  interests TEXT,
  challenges TEXT,
  session_summary TEXT,
  tc_acceptance JSONB,
  lead_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  source TEXT DEFAULT 'chat_interaction',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow anonymous insert for leads" ON leads 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access for leads" ON leads 
  FOR SELECT USING (true);

CREATE POLICY "Allow service_role full access for leads" ON leads 
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('---');
        
      } else {
        console.log('✅ Leads table is accessible');
        console.log('Structure appears to be correct but may have schema cache issues');
        console.log('\n💡 Try refreshing your Supabase dashboard or wait a few minutes for cache to clear');
      }
      
    } else {
      console.log('✅ Found leads table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
      });
      
      const requiredColumns = ['id', 'name', 'email', 'company', 'role', 'status'];
      const existingColumns = columns.map(c => c.column_name);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`\n❌ Missing required columns: ${missingColumns.join(', ')}`);
        console.log('\nAdd missing columns with:');
        missingColumns.forEach(col => {
          const colDef = {
            'name': 'name TEXT NOT NULL',
            'email': 'email TEXT NOT NULL UNIQUE',
            'company': 'company TEXT',
            'role': 'role TEXT',
            'status': 'status TEXT DEFAULT \'new\''
          }[col] || `${col} TEXT`;
          
          console.log(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ${colDef};`);
        });
      } else {
        console.log('\n✅ All required columns are present');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
}

checkLeadsSchema().catch(console.error);