// The ONE Supabase client (service_role) for the whole app — never call createClient() elsewhere.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../shared/types/database.types';
import { env } from './env';

export type SupabaseDb = SupabaseClient<Database>;

let client: SupabaseDb | undefined;

// Created on first use, not at import: a missing .env then surfaces as a clear error from
// the API call that needed it (e.g. /api/health) instead of crashing the whole server at
// boot, and services can be unit-tested by passing a fake client (ng test cannot vi.mock
// relative modules).
export function getSupabase(): SupabaseDb {
  // service_role bypasses RLS, so authorization must happen in the API layer, not here.
  // persistSession/autoRefreshToken are off: there is no browser session on a Node server.
  client ??= createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return client;
}
