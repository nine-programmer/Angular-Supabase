// Per-IP rate limiter for endpoints that write data without login (AGENTS.md → API Layer); route-level middleware, no table.
import type { RequestHandler } from 'express';

export interface RateLimitOptions {
  /** Length of the counting window in milliseconds. */
  windowMs: number;
  /** Requests allowed per IP inside one window; the next one answers 429. */
  max: number;
  /** Clock, injectable so specs can move time without waiting. */
  now?: () => number;
}

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Defaults from AGENTS.md when the SPEC (2.4) does not name its own numbers.
export const LOGIN_RATE_LIMIT: RateLimitOptions = { windowMs: FIFTEEN_MINUTES, max: 10 };
export const PUBLIC_WRITE_RATE_LIMIT: RateLimitOptions = { windowMs: FIFTEEN_MINUTES, max: 30 };

export const RATE_LIMIT_ERROR = 'ลองใหม่ภายหลัง';

interface Window {
  count: number;
  resetAt: number;
}

// Usage: router.post('/bookings', rateLimit(PUBLIC_WRITE_RATE_LIMIT), handler)
export function rateLimit({ windowMs, max, now = Date.now }: RateLimitOptions): RequestHandler {
  const windows = new Map<string, Window>();

  // Drop expired windows once the map gets large, so a long-running process does not grow forever.
  const sweep = (t: number) => {
    if (windows.size < 1000) return;
    for (const [key, w] of windows) if (w.resetAt <= t) windows.delete(key);
  };

  return (req, res, next) => {
    const t = now();
    sweep(t);
    // `req.ip` honours `trust proxy` (set in server.ts), so behind Render it is the client, not the proxy.
    const key = req.ip ?? 'unknown';
    let w = windows.get(key);
    if (!w || w.resetAt <= t) {
      w = { count: 0, resetAt: t + windowMs };
      windows.set(key, w);
    }
    w.count += 1;
    if (w.count > max) {
      res.status(429).json({ error: RATE_LIMIT_ERROR });
      return;
    }
    next();
  };
}
