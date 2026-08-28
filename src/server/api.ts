// Root /api router: body parser, every feature router, then the shared 404 + error handler. server.ts imports only this file.
import express, { Router } from 'express';
import { apiErrorHandler } from './api-error';
import { healthRoutes } from './routes/health.routes';

export const apiRouter = Router();

// Parsers live here, not in server.ts, so their errors (bad JSON, oversized body) reach apiErrorHandler as JSON.
apiRouter.use(express.json({ limit: '1mb' }));

apiRouter.use(healthRoutes);

// Unknown /api paths must answer JSON here; otherwise they would fall through to Angular SSR and return HTML.
apiRouter.use((_req, res) => {
  res.status(404).json({ error: 'ไม่พบ API นี้' });
});
apiRouter.use(apiErrorHandler);
