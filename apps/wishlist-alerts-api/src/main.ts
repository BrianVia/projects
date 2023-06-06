/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';

import 'dotenv/config';

import { Logger } from '@common/logger';
import { wishlistRouter } from './api/wishlist/router';
import { MonitoringService } from './services/monitoring';
import { cronjobs } from './api/cronjobs/cronjobs';

const allowedOrigins = ['http://localhost:4200', 'https://wishlistalerts.io'];
const app = express();

const monitoringService = new MonitoringService();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const logger = new Logger();

app.use('/api/v1/wishlist', wishlistRouter);

const cronHandler = new cronjobs();

console.log('Cron jobs scheduled to run...');
cronHandler.scheduleJobs();

//

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', logger.error);
