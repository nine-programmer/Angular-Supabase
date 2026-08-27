import { Router } from 'express';

export const healthRoutes = Router();

// Template placeholder: TASKS.md Task 2 (database) extends this to also return
// `count` of the main table, so it doubles as a DB-connectivity check.
healthRoutes.get('/health', (_req, res) => {
  res.json({ ok: true });
});
