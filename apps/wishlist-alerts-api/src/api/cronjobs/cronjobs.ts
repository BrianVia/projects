import * as cron from 'node-cron';

import { MonitoringService } from '../../services/monitoring';

const monitoringService = new MonitoringService();

export class cronjobs {
  scheduleJobs() {
    console.log('Scheduling cron jobs...');

    console.log('Monitoring Wishlists Daily at Midnight EST');
    cron.schedule(
      '0 * * * *',
      () => {
        // UTC Time
        monitoringService.monitorWishlists('daily');
      },
      {
        scheduled: true,
        timezone: 'America/New_York',
      }
    );
  }
}
