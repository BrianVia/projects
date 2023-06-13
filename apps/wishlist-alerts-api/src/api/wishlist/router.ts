import { Router } from 'express';
import cors from 'cors';
import { WishlistController } from './controller';
import { Logger } from '@common/logger';
import { WishlistService } from './service';
import { AuthService } from '../../lib/auth';

const wishlistController = new WishlistController();

export const wishlistRouter = Router().use(cors());

wishlistRouter.post(`/new`, wishlistController.handlePostNewWishlist);
wishlistRouter.post('/:id/items', wishlistController.handlePostWishlistItems);
wishlistRouter.post(
  '/:id/analyze',
  wishlistController.handleWishlistAnalyzeItems
);
wishlistRouter.get(
  '/:id/discounts',
  wishlistController.handleGetWishlistCurrentDiscounts
);

wishlistRouter.get(
  `/user/:userId`,
  wishlistController.handleGetAllUserWishlists
);
