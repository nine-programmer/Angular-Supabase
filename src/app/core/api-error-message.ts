// Turns a failed /api call into the Thai sentence a page shows the user (inside role="alert").
import { HttpErrorResponse } from '@angular/common/http';

export const GENERIC_API_ERROR = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

/** Reads the `{ error }` body every /api route answers with; anything else (network down, HTML) becomes the generic text. */
export function apiErrorMessage(err: unknown, fallback: string = GENERIC_API_ERROR): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: unknown } | null;
    if (body && typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }
    if (err.status === 0) {
      return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต';
    }
  }
  return fallback;
}
