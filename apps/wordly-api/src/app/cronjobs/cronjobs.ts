import * as cron from 'node-cron';
import { cleanDomains, getDomains, sendEmails } from '@wordly-domains/data';

export class cronjobs {
  scheduleJobs() {
    cron.schedule('30 11 * * 1,3,5', () => {
      sendEmails();
    });
    cron.schedule('0 5 * * *', () => {
      getDomains();
    });
    cron.schedule('15 5 * * *', () => {
      cleanDomains();
    });
  }
}
