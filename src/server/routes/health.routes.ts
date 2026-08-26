import { Router } from 'express';

export const healthRoutes = Router();

// Template placeholder: once a project has a main table, its SYSTEM_SPEC Task 3
// extends this to also return a row count, so it doubles as a DB-connectivity check.
healthRoutes.get('/health', (_req, res) => {
  res.json({ ok: true });
});
