import { createClient } from '@supabase/supabase-js';
import type { Database } from '../shared/types/database.types';
import { env } from './env';

// The ONE Supabase client for the whole app — never call createClient() elsewhere.
// Uses the service_role key (RLS-bypassing), so authorization must happen in the
// API layer, not here. persistSession/autoRefreshToken are off: there is no
// browser session to persist on a Node server.
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
