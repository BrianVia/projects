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
// import { sendEmails } from '@wordly-domains/email';
// import { loadDomains } from '@wordly-domains/data';

const allowedOrigins = ['http://localhost:4200', 'https://wishlistalerts.io'];
const app = express();

const monitoringService = new MonitoringService();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const logger = new Logger();

app.use('/api/v1/wishlist', wishlistRouter);

const cronHandler = new cronjobs();
cronHandler.scheduleJobs();

//

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', logger.error);
