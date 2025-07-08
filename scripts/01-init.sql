-- Create lead_summaries table
CREATE TABLE IF NOT EXISTS lead_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company_name TEXT,
    role TEXT,
    interests TEXT,
    lead_score INTEGER,
    conversation_summary TEXT,
    consultant_brief TEXT,
    ai_capabilities_shown TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update 'updated_at' on row update
CREATE TRIGGER update_lead_summaries_updated_at
BEFORE UPDATE ON lead_summaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE lead_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_summaries
-- Allow public read access
CREATE POLICY "Allow public read access" ON lead_summaries FOR SELECT USING (true);
-- Allow authenticated users to insert their own lead summary
CREATE POLICY "Allow authenticated insert" ON lead_summaries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Allow users to update their own summary
CREATE POLICY "Allow user update" ON lead_summaries FOR UPDATE USING (auth.uid() = id);
-- Allow service_role to bypass RLS
CREATE POLICY "Allow service_role access" ON lead_summaries FOR ALL USING (auth.role() = 'service_role');

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_lead_summaries_email ON lead_summaries(email);
CREATE INDEX IF NOT EXISTS idx_lead_summaries_created_at ON lead_summaries(created_at);
