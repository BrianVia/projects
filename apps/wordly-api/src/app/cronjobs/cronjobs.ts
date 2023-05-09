import * as cron from 'node-cron';
import { cleanDomains, loadDomains } from '@wordly-domains/data';
import { sendEmails } from '@wordly-domains/email';

export class cronjobs {
  scheduleJobs() {
    cron.schedule('30 11 * * *', () => {
      sendEmails();
    });
    cron.schedule('0 5 * * *', () => {
      loadDomains();
    });
    cron.schedule('15 5 * * *', () => {
      cleanDomains();
    });
  }
}
