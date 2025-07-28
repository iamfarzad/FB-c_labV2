-- Add activities table for activity logging
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for activities table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert for activities" ON activities 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access for activities" ON activities 
  FOR SELECT USING (true);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Enable realtime for activities table
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
