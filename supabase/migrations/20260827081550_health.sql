-- Template baseline (ships with every project): health() lets GET /api/health prove that
-- SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are right and that `npm run db:push` reaches
-- this project, before any project-specific migration exists. Keep this file.
create or replace function public.health()
returns integer
language sql
stable
as $$
  select 1;
$$;

-- Same deny-all stance as the tables: only the server's service_role may call it, so an
-- anon key pasted into .env by mistake fails the health check instead of passing silently.
revoke execute on function public.health() from public, anon, authenticated;
grant execute on function public.health() to service_role;
