// Root /api router: mounts every feature router. server.ts imports only this file.
import { Router } from 'express';
import { healthRoutes } from './routes/health.routes';

export const apiRouter = Router();

apiRouter.use(healthRoutes);
