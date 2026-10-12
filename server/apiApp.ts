import express from 'express';
import { apiRouter } from './apiRouter.ts';

export const apiApp = express();
apiApp.use(express.json({ limit: '2mb' }));
apiApp.use('/api', apiRouter);
apiApp.use('/', apiRouter);
