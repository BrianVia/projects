import { Router } from 'express';
import cors from 'cors';
import { WishlistController } from './controller';
import { Logger } from '@common/logger';

const logger = new Logger();

const wishlistController = new WishlistController();

export const wishlistRouter = Router().use(cors());

wishlistRouter.post(`/new`, wishlistController.handlePostNewWishlist);
