/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

import 'dotenv/config';

import { cronjobs } from './app/cronjobs/cronjobs';
import { Logger } from '@wordly-domains/logger';
import { userRouter } from './app/api/user';
import { sendEmails } from '@wordly-domains/email';
const allowedOrigins = ['http://localhost:4200', 'https://wordly.domains/'];
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
const logger = new Logger();

const cronHandler = new cronjobs();
cronHandler.scheduleJobs();

app.use('/api/v1/user', userRouter);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', logger.error);
