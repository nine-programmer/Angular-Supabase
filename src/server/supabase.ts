// The ONE Supabase client (service_role) for the whole app — never call createClient() elsewhere.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../shared/types/database.types';
import { env } from './env';

// service_role bypasses RLS, so authorization must happen in the API layer, not here.
// persistSession/autoRefreshToken are off: there is no browser session on a Node server.
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
