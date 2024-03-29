import * as cron from 'node-cron';

import { MonitoringService } from '../../services/monitoring';

const monitoringService = new MonitoringService();

import winston from 'winston';
const logger = winston.createLogger({
  level: process.env.WISHLIST_ALERTS_LOG_LEVEL || 'info',
  format: winston.format.json(),
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
    console.log('Scheduling cron jobs...');

    console.log('Monitoring Wishlists Daily at Midnight EST');
    cron.schedule(`0 0 * * *`, async () => {
      const ranDaily = await monitoringService.monitorWishlists('daily');
      if (ranDaily) {
        console.log('Daily cron job ran at ' + new Date().toLocaleString());
      }
    });

    cron.schedule('0 * * * *', async () => {
      console.log(`Hourly cron job running at ${new Date().toLocaleString()}`);
      const ranDaily = await monitoringService.monitorWishlists('hourly');
      if (ranDaily) {
        console.log('Daily cron job ran at ' + new Date().toLocaleString());
      }
    });
  }
}
