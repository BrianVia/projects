/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import 'dotenv/config';

import { cronjobs } from './app/cronjobs/cronjobs';

const app = express();

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to wordly-api!' });
});
console.log(process.env);

const cronHandler = new cronjobs();
cronHandler.scheduleJobs();

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
