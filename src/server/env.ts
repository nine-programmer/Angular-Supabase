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

// The ONE place process.env is read — every other server file imports this.
export const env = {
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  port: Number(process.env['PORT']) || 4000,
};
