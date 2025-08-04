-- Add missing meetings table for admin dashboard
-- This table is required by the admin dashboard meetings functionality

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES lead_summaries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  meeting_type TEXT DEFAULT 'consultation' CHECK (meeting_type IN ('consultation', 'follow_up', 'demo', 'onboarding')),
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  attendees JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create performance indexes for meetings
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_meetings_user_date ON meetings(user_id, meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status_date ON meetings(status, meeting_date);

-- Enable RLS on meetings table
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meetings
CREATE POLICY "meetings_select_own" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meetings_insert_own" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meetings_update_own" ON meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "meetings_delete_own" ON meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at column
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON meetings TO authenticated;

-- Enable realtime for meetings table
DO $$
BEGIN
    -- Enable realtime for meetings table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'meetings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
    END IF;
END $$;

-- Insert some sample meetings for testing (optional)
INSERT INTO meetings (
  title, 
  description, 
  meeting_date, 
  meeting_time, 
  status, 
  meeting_type,
  location,
  notes
) VALUES 
(
  'Initial Consultation', 
  'First meeting to discuss business needs and AI implementation strategy',
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  'scheduled',
  'consultation',
  'Virtual Meeting',
  'Prepare presentation on AI solutions'
),
(
  'Follow-up Meeting', 
  'Review progress and discuss next steps',
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  'scheduled',
  'follow_up',
  'Client Office',
  'Bring implementation timeline'
),
(
  'Demo Session', 
  'Live demonstration of AI capabilities',
  CURRENT_DATE + INTERVAL '7 days',
  '11:00:00',
  'confirmed',
  'demo',
  'Virtual Meeting',
  'Prepare demo environment'
) ON CONFLICT DO NOTHING;

-- Analyze table for better query planning
ANALYZE meetings;

-- Migration completed successfully
SELECT 'Meetings table migration completed successfully' as status;
