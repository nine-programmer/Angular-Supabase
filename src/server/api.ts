import { Router } from 'express';
import { healthRoutes } from './routes/health.routes';

// Mount every feature router here. server.ts imports only this file.
export const apiRouter = Router();

apiRouter.use(healthRoutes);
