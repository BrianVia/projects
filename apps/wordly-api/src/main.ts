/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as cors from 'cors';
import 'dotenv/config';

import { cronjobs } from './app/cronjobs/cronjobs';
import { Logger } from '@wordly-domains/logger';
import { userRouter } from './app/api/user';
import { sendEmails } from '@wordly-domains/email';

const app = express();
app.use(cors());
const logger = new Logger();

logger.debug(JSON.stringify(process.env));

const cronHandler = new cronjobs();
cronHandler.scheduleJobs();

sendEmails();
app.use('/api/v1/user', userRouter);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', logger.error);
