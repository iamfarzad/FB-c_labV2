-- Seed minimal capability map
insert into capability_usage_log (session_id, capability, first_used_at, context)
select 'seed', cap, now(), '{}'::jsonb
from (values
  ('roi'), ('translate'), ('screenShare'), ('webcam'), ('exportPdf'), ('search'), ('urlContext'), ('leadResearch')
) as caps(cap)
on conflict do nothing;


