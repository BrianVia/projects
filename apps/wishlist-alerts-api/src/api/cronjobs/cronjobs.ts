import * as cron from 'node-cron';

import { MonitoringService } from '../../services/monitoring';

const monitoringService = new MonitoringService();

import winston from 'winston';
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

export class cronjobs {
  scheduleJobs() {
    logger.info('Scheduling cron jobs...');

    logger.info('Monitoring Wishlists Daily at Midnight EST');
    cron.schedule(
      `0 0 * * *`,
      () => {
        monitoringService.monitorWishlists('daily');
      },
      {
        scheduled: true,
        timezone: 'America/New_York',
      }
    );

    cron.schedule(
      '0 * * * *',
      () => {
        logger.info(
          `Hourly cron job running at ${new Date().toLocaleString()}`
        );
      },
      {
        scheduled: true,
        timezone: 'America/New_York',
      }
    );
  }
}
