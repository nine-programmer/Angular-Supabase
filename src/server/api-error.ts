// Turns a Supabase/Postgres error into the HTTP status + Thai message every /api route answers with.
import type { NextFunction, Request, Response } from 'express';

export type ApiError = { status: number; error: string };

/** Thrown by a service (or route) when the request must fail with a specific status. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const GENERIC_ERROR = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

// SQLSTATE codes our own SQL raises on purpose (AGENTS.md → API Layer). Their message is written
// in Thai inside the Postgres function, so it is the one DB message safe to show the browser.
// (A P0001 raised by a third-party trigger would leak its English text — keep user-facing rules
// in functions we write.)
const RULE_REJECTED = 'P0001'; // RAISE EXCEPTION 'ข้อความไทย'                       → 400
const CONFLICT = 'P0409'; //     RAISE EXCEPTION 'ข้อความไทย' USING ERRCODE = 'P0409' → 409

type DbError = { code?: string | null; message?: string | null } | null | undefined;

/** Maps the `error` half of a supabase-js result to an API response; anything unknown is a generic 500. */
export function toApiError(err: DbError): ApiError {
  const code = err?.code ?? '';
  if (code === RULE_REJECTED) {
    return { status: 400, error: err?.message || 'ข้อมูลไม่ผ่านกติกาของระบบ' };
  }
  if (code === CONFLICT) {
    return { status: 409, error: err?.message || 'สถานะไม่ตรงเงื่อนไข' };
  }
  if (code === '23505') return { status: 409, error: 'ข้อมูลนี้มีอยู่แล้ว' }; // unique_violation
  // foreign_key_violation: an id in the body points nowhere (insert) or the row is still referenced (delete)
  if (code === '23503')
    return { status: 409, error: 'ข้อมูลที่อ้างถึงไม่มีอยู่ หรือยังถูกใช้งานอยู่' };
  if (code === '23502' || code === '23514' || code.startsWith('22')) {
    return { status: 400, error: 'ข้อมูลไม่ถูกต้อง' }; // not_null / check_violation / data exception
  }
  if (code === 'PGRST116') return { status: 404, error: 'ไม่พบข้อมูล' }; // .single() matched 0 rows
  return { status: 500, error: GENERIC_ERROR };
}

/** `if (error) throwApiError(error)` — the one-liner services use after every Supabase call. */
export function throwApiError(err: DbError): never {
  const { status, error } = toApiError(err);
  if (status === 500) {
    console.error('[api] unexpected database error:', err);
  }
  throw new HttpError(status, error);
}

// Express 5 forwards a rejected promise from an async handler here, so routes just `await` services.
// Must keep 4 parameters: that is how Express recognises an error handler.
export function apiErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Errors from express.json() in api.ts: malformed JSON, or a body over its size limit.
  const type = (err as { type?: string } | null)?.type;
  if (type === 'entity.parse.failed') {
    res.status(400).json({ error: 'รูปแบบข้อมูลที่ส่งมาไม่ถูกต้อง' });
    return;
  }
  if (type === 'entity.too.large') {
    res.status(413).json({ error: 'ข้อมูลที่ส่งมาใหญ่เกินไป' });
    return;
  }
  // Other client-side failures raised by Express/body-parser (unsupported charset, etc.).
  const status = (err as { status?: number } | null)?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    res.status(status).json({ error: 'คำขอไม่ถูกต้อง' });
    return;
  }
  console.error('[api] unhandled error:', err);
  res.status(500).json({ error: GENERIC_ERROR });
}
