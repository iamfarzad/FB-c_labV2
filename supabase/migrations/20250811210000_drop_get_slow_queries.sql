-- Pre-drop conflicting function signature so later migration can recreate it
DROP FUNCTION IF EXISTS public.get_slow_queries();


