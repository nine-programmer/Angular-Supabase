import { checkDatabase, describeFailure } from './health-server.service';
import type { SupabaseDb } from '../supabase';

describe('describeFailure', () => {
  it('maps connection drops (status 0, 502, 503) to a network/proxy guidance message', () => {
    expect(describeFailure(0, undefined)).toContain('เชื่อมต่อ SUPABASE_URL ไม่ได้');
    expect(describeFailure(502, undefined)).toContain('เชื่อมต่อ SUPABASE_URL ไม่ได้');
    expect(describeFailure(503, undefined)).toContain('เชื่อมต่อ SUPABASE_URL ไม่ได้');
  });

  it('maps auth failures (status 401, 403) to service_role key guidance', () => {
    expect(describeFailure(401, 'PGRST301')).toContain('SUPABASE_SERVICE_ROLE_KEY ไม่ถูกต้อง');
    expect(describeFailure(403, undefined)).toContain('SUPABASE_SERVICE_ROLE_KEY ไม่ถูกต้อง');
  });

  it('maps missing health function (PGRST202 or 404) to migration guidance', () => {
    expect(describeFailure(404, 'PGRST202')).toContain('ยังไม่มี function health()');
    expect(describeFailure(404, undefined)).toContain('ยังไม่มี function health()');
  });

  it('falls back to generic error message for other statuses', () => {
    expect(describeFailure(500, undefined)).toContain('เชื่อมต่อฐานข้อมูลไม่สำเร็จ');
  });
});

describe('checkDatabase', () => {
  it('returns ok: true when rpc succeeds', async () => {
    const fakeDb = {
      rpc: vi.fn().mockResolvedValue({ data: 1, error: null, status: 200 }),
    } as unknown as SupabaseDb;

    const result = await checkDatabase(fakeDb);
    expect(result).toEqual({ ok: true });
  });

  it('returns ok: false with mapped error when rpc fails', async () => {
    const fakeDb = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST202', message: 'Not found' },
        status: 404,
      }),
    } as unknown as SupabaseDb;

    const result = await checkDatabase(fakeDb);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('ยังไม่มี function health()');
    }
  });
});

