# Supabase Migration Instructions

## 🚨 **URGENT: Apply Database Migration Before Deployment**

Your database is missing 3 critical tables needed for the new architecture. Follow these steps to apply the migration:

### ✅ **Step 1: Access Supabase Dashboard**

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `ksmxqswuzrmdgckwxkvn`

### ✅ **Step 2: Open SQL Editor**

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** to create a new SQL script

### ✅ **Step 3: Execute Migration Statements**

Copy and paste each CREATE TABLE statement below into the SQL Editor and execute them **one by one**:

#### **Table 1: conversations**
```sql
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'greeting' CHECK (stage IN (
    'greeting', 'name_collection', 'email_capture', 
    'background_research', 'problem_discovery', 
    'solution_presentation', 'call_to_action'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  lead_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Table 2: transcripts**
```sql
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'audio', 'image', 'document', 'tool_call', 'system')),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  audio_data TEXT,
  image_data TEXT,
  document_data JSONB,
  tool_name TEXT,
  tool_input JSONB,
  tool_output JSONB,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Table 3: voice_sessions**
```sql
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  websocket_connection_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'error')),
  duration_seconds INTEGER,
  audio_chunks_sent INTEGER DEFAULT 0,
  audio_chunks_received INTEGER DEFAULT 0,
  total_audio_bytes INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Table 4: conversation_insights**
```sql
CREATE TABLE IF NOT EXISTS conversation_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'pain_point', 'opportunity', 'objection', 
    'buying_signal', 'competitor_mention', 'budget_indicator'
  )),
  insight_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Table 5: follow_up_tasks**
```sql
CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('email', 'call', 'demo', 'proposal', 'check_in')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  task_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ✅ **Step 4: Apply Additional Configuration**

After creating the tables, run these additional configuration statements:

#### **Indexes for Performance**
```sql
-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_stage ON conversations(stage);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- Transcripts indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_conversation_id ON transcripts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_lead_id ON transcripts(lead_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_message_type ON transcripts(message_type);
CREATE INDEX IF NOT EXISTS idx_transcripts_role ON transcripts(role);
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON transcripts(created_at DESC);

-- Voice sessions indexes
CREATE INDEX IF NOT EXISTS idx_voice_sessions_conversation_id ON voice_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session_id ON voice_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);

-- Conversation insights indexes
CREATE INDEX IF NOT EXISTS idx_conversation_insights_conversation_id ON conversation_insights(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_insights_lead_id ON conversation_insights(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversation_insights_type ON conversation_insights(insight_type);

-- Follow-up tasks indexes
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_lead_id ON follow_up_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_status ON follow_up_tasks(status);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_scheduled_for ON follow_up_tasks(scheduled_for);
```

#### **Row Level Security (RLS) Policies**
```sql
-- Enable RLS on all new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "conversations_public_insert" ON conversations 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "conversations_public_select" ON conversations 
  FOR SELECT USING (true);

CREATE POLICY "conversations_public_update" ON conversations 
  FOR UPDATE USING (true);

CREATE POLICY "conversations_service_role" ON conversations 
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for transcripts
CREATE POLICY "transcripts_public_insert" ON transcripts 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "transcripts_public_select" ON transcripts 
  FOR SELECT USING (true);

CREATE POLICY "transcripts_service_role" ON transcripts 
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for voice_sessions
CREATE POLICY "voice_sessions_public_insert" ON voice_sessions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "voice_sessions_public_select" ON voice_sessions 
  FOR SELECT USING (true);

CREATE POLICY "voice_sessions_public_update" ON voice_sessions 
  FOR UPDATE USING (true);

CREATE POLICY "voice_sessions_service_role" ON voice_sessions 
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for conversation_insights
CREATE POLICY "conversation_insights_public_insert" ON conversation_insights 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "conversation_insights_public_select" ON conversation_insights 
  FOR SELECT USING (true);

CREATE POLICY "conversation_insights_service_role" ON conversation_insights 
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for follow_up_tasks
CREATE POLICY "follow_up_tasks_public_insert" ON follow_up_tasks 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "follow_up_tasks_public_select" ON follow_up_tasks 
  FOR SELECT USING (true);

CREATE POLICY "follow_up_tasks_public_update" ON follow_up_tasks 
  FOR UPDATE USING (true);

CREATE POLICY "follow_up_tasks_service_role" ON follow_up_tasks 
  FOR ALL USING (auth.role() = 'service_role');
```

#### **Triggers for Updated Timestamps**
```sql
-- Create triggers for updated_at columns
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_up_tasks_updated_at
  BEFORE UPDATE ON follow_up_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### **Enable Realtime (Optional)**
```sql
-- Enable realtime for new tables (if you want real-time subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE transcripts;
ALTER PUBLICATION supabase_realtime ADD TABLE voice_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE follow_up_tasks;
```

### ✅ **Step 5: Verify Migration**

After executing all statements, run the verification script:

```bash
cd scripts
node verify-supabase-schema.mjs
```

You should see:
```
✅ Table 'voice_sessions' exists
✅ Table 'conversation_insights' exists
✅ Table 'follow_up_tasks' exists
🎉 Database schema is complete and ready for deployment!
```

### ✅ **Step 6: Generate TypeScript Types (Optional)**

Update your TypeScript types:
```bash
npx supabase gen types typescript --project-id ksmxqswuzrmdgckwxkvn > types/supabase.ts
```

## 🚨 **Important Notes**

1. **Execute statements in order** - Tables have foreign key dependencies
2. **Check for errors** - If any statement fails, fix before continuing
3. **Backup recommended** - Though these are CREATE IF NOT EXISTS statements
4. **Test after migration** - Verify the verification script passes

## 📞 **If You Need Help**

If any statement fails or you encounter issues:

1. Check the Supabase logs in the dashboard
2. Ensure the `leads` table exists (it should)
3. Verify you have the correct permissions
4. Try executing statements individually

Once complete, your database will be ready for the new architecture with full conversation tracking, voice sessions, and automated follow-ups! 🎉