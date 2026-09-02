-- Template baseline (ships with every project): the PostgREST roles and grants that Supabase
-- cloud provides out of the box, so the very same migrations also run on a self-hosted
-- Postgres + PostgREST (README → "Deploy บน VPS ของตัวเอง"). On Supabase cloud every block
-- below is skipped or a harmless repeat. Keep this file.
--
-- Named with a timestamp just before *_health.sql on purpose: health() grants execute to
-- service_role, so that role must exist first. Never rename either file.

-- 1. Roles. Supabase cloud already has all four; a plain Postgres has none.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  -- bypassrls is what lets the server read tables that have RLS enabled with no policies
  -- (the template's deny-all stance); without it every query would return zero rows.
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  -- PostgREST logs in as authenticator, then switches to the role named in the JWT.
  -- Its password is set on the VPS (`alter role authenticator password '...'`), never here.
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator noinherit login;
    grant anon, authenticated, service_role to authenticator;
  end if;
end $$;

-- 2. Grants. On Supabase cloud these already hold; repeating them is a no-op. The default
-- privileges are the important part: without them, tables created by later migrations are
-- invisible to service_role on a plain Postgres (cloud sets the same defaults for `postgres`).
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;

-- 3. Schema-cache reload. PostgREST caches the schema and would answer 404 for a table added
-- by a later `db:push:url` until restarted; this event trigger tells it to reload after every
-- DDL, exactly like Supabase's own `pgrst_ddl_watch`. Creating an event trigger needs
-- superuser, so it is skipped where one already exists (Supabase cloud).
do $$
begin
  if not exists (
    select 1 from pg_event_trigger where evtevent = 'ddl_command_end' and evtname like 'pgrst%'
  ) then
    create or replace function public.pgrst_reload_schema()
    returns event_trigger
    language plpgsql
    as $fn$
    begin
      notify pgrst, 'reload schema';
    end
    $fn$;
    -- Same deny-all stance as health(): an event-trigger function cannot be called through
    -- PostgREST anyway, but every function in public gets the explicit revoke.
    revoke execute on function public.pgrst_reload_schema() from public, anon, authenticated;
    create event trigger pgrst_reload_schema
      on ddl_command_end
      execute function public.pgrst_reload_schema();
  end if;
end $$;
