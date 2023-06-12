import * as cron from 'node-cron';

import { MonitoringService } from '../../services/monitoring';

const monitoringService = new MonitoringService();

export class cronjobs {
  scheduleJobs() {
    console.log('Scheduling cron jobs...');

    console.log('Monitoring Wishlists Daily at 2:00 AM UTC');
    cron.schedule('0 2 * * *', async () => {
      // UTC Time
      const ran = await monitoringService.monitorWishlists('daily');
    });
  }
}
