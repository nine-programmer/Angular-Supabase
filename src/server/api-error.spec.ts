// Verifies the DB-error → HTTP status mapping that every /api route relies on.
import { GENERIC_ERROR, toApiError } from './api-error';

describe('toApiError', () => {
  it('passes our own Thai messages through with the intended status', () => {
    expect(toApiError({ code: 'P0001', message: 'ยืมเกินจำนวนคงเหลือ' })).toEqual({
      status: 400,
      error: 'ยืมเกินจำนวนคงเหลือ',
    });
    expect(toApiError({ code: 'P0409', message: 'คำขอนี้ถูกปิดไปแล้ว' })).toEqual({
      status: 409,
      error: 'คำขอนี้ถูกปิดไปแล้ว',
    });
  });

  it('maps constraint violations without leaking the raw message', () => {
    const dup = toApiError({
      code: '23505',
      message: 'duplicate key value violates unique constraint "items_code_key"',
    });
    expect(dup).toEqual({ status: 409, error: 'ข้อมูลนี้มีอยู่แล้ว' });
    expect(toApiError({ code: '23503', message: 'x' }).status).toBe(409);
    expect(toApiError({ code: '23514', message: 'x' }).status).toBe(400);
    expect(toApiError({ code: '22P02', message: 'x' }).status).toBe(400);
    expect(toApiError({ code: 'PGRST116', message: 'x' }).status).toBe(404);
  });

  it('hides everything else behind a generic 500', () => {
    expect(toApiError({ code: '42P01', message: 'relation "x" does not exist' })).toEqual({
      status: 500,
      error: GENERIC_ERROR,
    });
    expect(toApiError(null).status).toBe(500);
  });
});
