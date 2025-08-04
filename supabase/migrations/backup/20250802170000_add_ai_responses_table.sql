-- Create AI responses table for real-time AI interactions
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  text TEXT,
  audio_data TEXT, -- base64 encoded audio
  image_data TEXT, -- base64 encoded image
  response_type TEXT NOT NULL, -- 'voice', 'video_analysis', 'screen_analysis', 'text'
  tools_used TEXT[], -- Array of tools used, e.g., ['ROICalculator', 'ScreenShare']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_responses_session_id ON ai_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_activity_id ON ai_responses(activity_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_created_at ON ai_responses(created_at);

-- Enable Row Level Security
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own AI responses" ON ai_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI responses" ON ai_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Authenticated users can update their own responses" ON ai_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_ai_responses_updated_at
  BEFORE UPDATE ON ai_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_responses_updated_at();

-- Add comments to columns for better documentation
COMMENT ON COLUMN ai_responses.user_id IS 'Foreign key to the user who initiated the AI interaction.';
COMMENT ON COLUMN ai_responses.session_id IS 'The unique session identifier for a user interaction.';
COMMENT ON COLUMN ai_responses.activity_id IS 'Foreign key to an activity, if this response is part of a larger activity.';
COMMENT ON COLUMN ai_responses.audio_data IS 'Base64 encoded audio data for voice responses.';
COMMENT ON COLUMN ai_responses.image_data IS 'Base64 encoded image data for vision-related responses.';
COMMENT ON COLUMN ai_responses.response_type IS 'The type of AI response, e.g., voice, video_analysis.';
COMMENT ON COLUMN ai_responses.tools_used IS 'Array of tool names used in the AI response.';

-- Enable realtime for ai_responses table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'ai_responses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ai_responses;
    END IF;
END $$;
