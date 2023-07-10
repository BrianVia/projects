import { Router } from 'express';
import cors from 'cors';
import { WishlistController } from './controller';

const wishlistController = new WishlistController();

export const wishlistRouter = Router().use(cors());

wishlistRouter.post(`/new`, wishlistController.handlePostNewWishlist);
wishlistRouter.post('/:id/items', wishlistController.handlePostWishlistItems);
wishlistRouter.get('/:id/items', wishlistController.handleGetWishlistItems);
wishlistRouter.post(
  '/:id/analyze',
  wishlistController.handleWishlistAnalyzeItems
);
wishlistRouter.get(
  '/:id/discounts',
  wishlistController.handleGetWishlistCurrentDiscounts
);

wishlistRouter.get(
  `/user/:userId/discounts`,
  wishlistController.handleGetAllUserDiscounts
);
//TODO MOVE TO A USER CONTROLLER PERHAPS

wishlistRouter.get(
  `/user/:userId/wishlists`,
  wishlistController.handleGetAllUserWishlists
);
