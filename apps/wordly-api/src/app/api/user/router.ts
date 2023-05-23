import { Router } from 'express';
import * as cors from 'cors';
import { UserController } from './controller';
import { Logger } from '@common/logger';

const logger = new Logger();

const userController = new UserController();

export const userRouter = Router().use(cors());

userRouter.get(`/:userId`, userController.handleUserGet);
userRouter.put(
  `/:userId/wordPreferences`,
  userController.handleWordPreferencesUpdate
);
userRouter.post(
  '/:userId/subscription',
  userController.handleSubscriptionUpdate
);
