/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import 'dotenv/config';

import { cronjobs } from './app/cronjobs/cronjobs';
import { Logger } from '@wordly-domains/logger';

const app = express();
const logger = new Logger();

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to wordly-api!' });
});
logger.debug(JSON.stringify(process.env));

const cronHandler = new cronjobs();
cronHandler.scheduleJobs();

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', logger.error);
