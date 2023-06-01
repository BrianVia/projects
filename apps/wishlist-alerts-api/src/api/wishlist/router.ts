import { Router } from 'express';
import cors from 'cors';
import { WishlistController } from './controller';
import { Logger } from '@common/logger';
import { WishlistService } from './service';
import { AuthService } from '../../lib/auth';

const wishlistService = new WishlistService();
const authService = new AuthService();

const wishlistController = new WishlistController(wishlistService, authService);

export const wishlistRouter = Router().use(cors());

wishlistRouter.post(`/new`, wishlistController.handlePostNewWishlist);
wishlistRouter.post('/:id/items', wishlistController.handlePostWishlistItems);
wishlistRouter.post(
  '/:id/analyze',
  wishlistController.handleWishlistAnalyzeItems
);
