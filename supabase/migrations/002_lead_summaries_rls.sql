-- RLS Policies for lead_summaries table
-- This should be run after the table is created and realtime is enabled

-- Allow public read access to all leads (for demonstration)
-- In production, you might want to restrict this to authenticated users
CREATE POLICY "Allow public read access"
ON public.lead_summaries
FOR SELECT
USING (true);

-- Allow authenticated users to insert new leads
-- You can add additional validation in the USING clause if needed
CREATE POLICY "Allow authenticated inserts"
ON public.lead_summaries
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own leads
-- Note: This assumes you'll add an 'owner_id' column in the future
-- For now, it allows any authenticated user to update any lead
CREATE POLICY "Allow updates by authenticated users"
ON public.lead_summaries
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow users to delete their own leads
-- Similar to update policy, this will be more restrictive in production
CREATE POLICY "Allow deletes by authenticated users"
ON public.lead_summaries
FOR DELETE
USING (auth.role() = 'authenticated');

-- Enable realtime for the table
-- This is already in your initial setup, but included here for completeness
-- ALTER PUBLICATION supabase_realtime ADD TABLE lead_summaries;

-- Add a comment about future security considerations
COMMENT ON POLICY "Allow public read access" ON public.lead_summaries IS 
'This allows public read access for demonstration. In production, consider restricting to authenticated users or adding more granular controls.';

-- Optional: Add a function to check if a user can modify a lead
-- This can be used in more complex RLS policies
CREATE OR REPLACE FUNCTION public.can_modify_lead(lead_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, allow any authenticated user
  -- In the future, you can add logic like:
  -- RETURN EXISTS (
  --   SELECT 1 FROM lead_summaries 
  --   WHERE id = lead_id AND owner_id = auth.uid()
  -- );
  RETURN auth.role() = 'authenticated';
END;
$$;
