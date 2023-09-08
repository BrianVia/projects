/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as cors from 'cors';

import 'dotenv/config';

import { cronjobs } from './app/cronjobs/cronjobs';
import { Logger } from '@common/logger';
import { userRouter } from './app/api/user';
import { domainRouter } from './app/api/domains';
// import { sendEmails } from '@wordly-domains/email';
// import { loadDomains } from '@wordly-domains/data';

const allowedOrigins = ['http://localhost:4200', 'https://wordly.domains'];
const app = express();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const logger = new Logger();

const cronHandler = new cronjobs();
cronHandler.scheduleJobs();

app.use('/api/v1/user', userRouter);
app.use('/api/v1/domains', domainRouter);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', logger.error);
