-- PROPER RLS POLICIES - Run this after the API is working
-- This implements secure RLS policies for production use

-- 1. Re-enable RLS on both tables
ALTER TABLE lead_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_search_results ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "service_role full access" ON lead_summaries;
DROP POLICY IF EXISTS "users manage own leads" ON lead_summaries;
DROP POLICY IF EXISTS "service_role full access" ON lead_search_results;
DROP POLICY IF EXISTS "users read own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "users insert own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "users update own lead search results" ON lead_search_results;
DROP POLICY IF EXISTS "users delete own lead search results" ON lead_search_results;

-- 3. Create service role policies (allows service role to bypass RLS)
CREATE POLICY "service_role full access" 
  ON lead_summaries FOR ALL 
  USING (auth.role() = 'service_role') 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_role full access" 
  ON lead_search_results FOR ALL 
  USING (auth.role() = 'service_role') 
  WITH CHECK (auth.role() = 'service_role');

-- 4. Create user policies for lead_summaries
CREATE POLICY "users manage own leads"
  ON lead_summaries FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Create user policies for lead_search_results
CREATE POLICY "users read own lead search results" 
  ON lead_search_results FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  );

CREATE POLICY "users insert own lead search results"
  ON lead_search_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  );

-- 6. Create update and delete policies for lead_search_results
CREATE POLICY "users update own lead search results"
  ON lead_search_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  );

CREATE POLICY "users delete own lead search results"
  ON lead_search_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM lead_summaries 
      WHERE lead_summaries.id = lead_search_results.lead_id 
      AND lead_summaries.user_id = auth.uid()
    )
  );

-- 7. Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('lead_summaries', 'lead_search_results')
ORDER BY tablename, policyname;

-- 8. Test policy enforcement (optional - run this to verify)
-- This should return 0 rows if policies are working correctly
-- SELECT COUNT(*) FROM lead_summaries WHERE user_id IS NULL;
