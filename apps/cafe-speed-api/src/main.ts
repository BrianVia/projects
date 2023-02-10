/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import coffeeShopsRouter from './app/api/coffeeshops/router';

const app = express();

app.use('/api/coffee-shops', coffeeShopsRouter);

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`Coffee Shop API is running on port 3000`);
});
server.on('error', console.error);
