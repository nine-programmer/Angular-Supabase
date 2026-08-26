import 'dotenv/config';

// Fails fast at boot (not on first request) so a missing secret is caught
// immediately instead of surfacing as a confusing Supabase error later.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// @angular/ssr's AngularNodeAppEngine reads NG_ALLOWED_HOSTS from process.env
// itself (not through the `env` object below) to build its SSRF-prevention
// host allowlist — without it, every SSR request is rejected with "Bad
// Request". Default to localhost for local dev; production MUST set the
// real domain(s) (comma-separated) via NG_ALLOWED_HOSTS before deploying.
// Set unconditionally (never throws) so this file stays safe to import for
// its side effects alone — e.g. from server.ts, before any Supabase-backed
// route exists — including during `ng build`'s route-extraction step.
if (!process.env['NG_ALLOWED_HOSTS']) {
  process.env['NG_ALLOWED_HOSTS'] = 'localhost';
}

// The ONE place process.env is read — every other server file imports this.
// supabaseUrl/supabaseServiceRoleKey are getters, not eagerly computed: they
// only throw once something actually reads them (supabase.ts, when a real
// feature needs Supabase), not merely by importing this module.
export const env = {
  get supabaseUrl() {
    return required('SUPABASE_URL');
  },
  get supabaseServiceRoleKey() {
    return required('SUPABASE_SERVICE_ROLE_KEY');
  },
  port: Number(process.env['PORT']) || 4000,
};
