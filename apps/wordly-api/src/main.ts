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
const allowedOrigins = ['http://localhost:4200', 'https://wordly.domains'];
const app = express();

// const cors = {
//   origin: allowedOrigins,
//   optionsSuccessStatus: 200,
//   default: 'wordly.domains',
// };

// app.all('*', function (req, res, next) {
//   const origin = req.headers.origin;
//   if (cors.origin.indexOf(origin) >= 0) {
//     res.header('Access-Control-Allow-Origin', origin);
//   }
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });

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
