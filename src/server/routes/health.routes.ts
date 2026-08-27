// GET /api/health — proves the server can reach Supabase (used right after setup, before any spec).
import { Router } from 'express';
import { checkDatabase } from '../services/health-server.service';

export const healthRoutes = Router();

// Template placeholder: TASKS.md Task 2 (database) extends the response with
// `count` of the main table once that table exists.
healthRoutes.get('/health', async (_req, res) => {
  try {
    const result = await checkDatabase();
    res.status(result.ok ? 200 : 503).json(result);
  } catch (err) {
    // Only reached when the client cannot be built (missing/malformed .env values); that
    // message names the variable and is safe to show.
    const error = err instanceof Error ? err.message : 'ตั้งค่า .env ไม่ถูกต้อง';
    res.status(503).json({ ok: false, error });
  }
});
