/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';

import 'dotenv/config';

import { cronjobs } from './app/cronjobs/cronjobs';
import { Logger } from '@wordly-domains/logger';
import { userRouter } from './app/api/user';
import { sendEmails } from '@wordly-domains/email';
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4200#',
  'https://wordly.domains/',
];
const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(express.json());

const logger = new Logger();

const cronHandler = new cronjobs();
cronHandler.scheduleJobs();

app.use('/api/v1/user', userRouter);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', logger.error);
