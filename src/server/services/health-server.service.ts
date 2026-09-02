// Database connectivity check behind GET /api/health (Supabase cloud or self-hosted PostgREST): calls the template's health() function.
import { getSupabase, type SupabaseDb } from '../supabase';

export type HealthResult = { ok: true } | { ok: false; error: string };

// Maps the failure to the setup step that fixes it; the raw Supabase error never leaves the server.
export function describeFailure(status: number, code: string | undefined): string {
  if (status === 0) {
    return 'เชื่อมต่อ SUPABASE_URL ไม่ได้ — ตรวจค่าใน .env และการเชื่อมต่ออินเทอร์เน็ต';
  }
  if (status === 401 || status === 403) {
    return 'SUPABASE_SERVICE_ROLE_KEY ไม่ถูกต้อง หรือเป็น anon key — ต้องใช้ service_role key (บน server ของตัวเอง: JWT ต้องเซ็นด้วย jwt-secret เดียวกับ PostgREST และมี role: service_role)';
  }
  // PGRST202 = function not in the schema cache, i.e. the template migration was never pushed.
  if (code === 'PGRST202' || status === 404) {
    return 'ยังไม่มี function health() ในฐานข้อมูล — รัน `npm run db:push` ก่อน (หรือ `db:push:url` ถ้าฐานข้อมูลอยู่บน server ของตัวเอง)';
  }
  return 'เชื่อมต่อฐานข้อมูลไม่สำเร็จ — ดูรายละเอียดใน log ของ server';
}

// `db` is a parameter (default: the real client) so specs can pass a fake.
export async function checkDatabase(db: SupabaseDb = getSupabase()): Promise<HealthResult> {
  const { error, status } = await db.rpc('health');
  if (!error) {
    return { ok: true };
  }
  console.error('[health] supabase.rpc(health) failed:', error);
  return { ok: false, error: describeFailure(status, error.code) };
}
