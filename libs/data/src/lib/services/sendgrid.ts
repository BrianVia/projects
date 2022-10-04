import { MailService } from '@sendgrid/mail';
import 'dotenv/config';

export const sendGridMailService: MailService = new MailService();
sendGridMailService.setApiKey(
  process.env.SENDGRID_API_KEY || `no-api-key-provided`
);
