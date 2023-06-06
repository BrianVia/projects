import * as cron from 'node-cron';

import { MonitoringService } from '../../services/monitoring';

const monitoringService = new MonitoringService();

export class cronjobs {
  scheduleJobs() {
    console.log('Scheduling cron jobs...');

    console.log('Monitoring Wishlists Daily at 6:30 AM');
    cron.schedule('30 6 * * *', () => {
      monitoringService.monitorWishlists('daily');
    });
  }
}
