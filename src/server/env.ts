// Loads .env and exposes validated config — the ONE place process.env is read on the server.
import 'dotenv/config';

// Throws with the variable NAME so a missing secret is reported clearly, not as
// a confusing Supabase error later. Runs when supabase.ts is first imported.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// AngularNodeAppEngine reads NG_ALLOWED_HOSTS from process.env itself (SSRF host
// allowlist) and rejects every SSR request with 400 when it is unset. Default to
// localhost without throwing so this file is safe to import for its side effect
// alone (server.ts, `ng build`); production MUST set the real domain(s).
if (!process.env['NG_ALLOWED_HOSTS']) {
  process.env['NG_ALLOWED_HOSTS'] = 'localhost';
}

// supabaseUrl/supabaseServiceRoleKey are lazy getters: they throw only when read
// (by supabase.ts), not merely by importing this module.
export const env = {
  get supabaseUrl() {
    return required('SUPABASE_URL');
  },
  get supabaseServiceRoleKey() {
    return required('SUPABASE_SERVICE_ROLE_KEY');
  },
  port: Number(process.env['PORT']) || 4000,
  // PM2 sets pm_id; server.ts uses it to decide whether to call app.listen().
  isPm2: Boolean(process.env['pm_id']),
};
