/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';

import 'dotenv/config';

import winston from 'winston';
import { wishlistRouter } from './api/wishlist/router';
import { MonitoringService } from './services/monitoring';
import { cronjobs } from './api/cronjobs/cronjobs';

const allowedOrigins = ['http://localhost:4200', 'https://wishlistalerts.io'];
const app = express();

const monitoringService = new MonitoringService();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'wishlist-alerts-api' },
});
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

app.use('/api/v1/wishlist', wishlistRouter);

const cronHandler = new cronjobs();

logger.info('Cron jobs scheduled to run...');
cronHandler.scheduleJobs();

// monitoringService.monitorWishlists('daily'); // Just run at startup in the meantime

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});

server.on('error', logger.error);
