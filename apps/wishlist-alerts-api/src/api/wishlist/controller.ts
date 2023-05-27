import { Logger } from '@common/logger';
import { WishlistService } from './service';

import { Database } from '../../types/supabase';
import { AuthService } from '../../lib/auth';

const logger = new Logger();

class WishlistController {
  wishlistService: WishlistService;
  authService: AuthService;

  constructor(wishlistService: WishlistService, authService: AuthService) {
    this.wishlistService = wishlistService;
    this.authService = authService;
  }

  async handlePostNewWishlist(req, res, next) {
    logger.info(`received request: POST /api/v1/wishlist/new`);
    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   logger.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    const wishlistUrl: string = req.body.wishlistUrl as string;
    const addAllItems: boolean = req.body.addAllItems as boolean;
    logger.debug(`wishlistUrl: ${wishlistUrl}`);
    const wishlistData = await this.wishlistService.parseWishlist(wishlistUrl);

    const { data: existingWishlistData, error: fetchWishlistError } =
      await this.wishlistService.fetchWishlist(wishlistUrl);

    if (existingWishlistData.id !== undefined) {
      logger.info(`wishlist already exists in database`);
      //insert any new items if needed
      // update any wishlist properties?

      return res.status(400).json('wishlist already exists');
    } else {
      logger.info(`wishlist does not exist in database`);
      const { data: insertWishlistData, error: insertError } =
        await this.wishlistService.insertNewWishlist(
          wishlistData.wishlistUrl,
          process.env.WISHLIST_ALERTS_MY_USER_UUID,
          wishlistData.wishlistTitle
        );

      const insertWishlistItems =
        this.wishlistService.generateWishlistItemEntities(
          wishlistData,
          insertWishlistData.id
        );

      if (addAllItems) {
        const { data: insertItemsData, error: insertItemsError } =
          await this.wishlistService.upsertWishlistItems(
            insertWishlistItems,
            insertWishlistData.id
          );

        logger.log(insertItemsData);
        logger.error(insertItemsError);
      }

      res.status(201).json({
        ...insertWishlistData,
        wishlist_items: wishlistData.wishlishItems,
      });
    }
  }

  async handlePostWishlistItems(req, res, next) {
    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   logger.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    logger.info(`received request: POST /api/v1/wishlist/items`);

    const insertWishlistItems = req.body
      .wishlistItems as Database['public']['Tables']['wishlist_items']['Insert'][];
    const wishlistId = req.body.wishlistId as string;
    const wishlistBelongsToUser =
      await this.wishlistService.withlistBelongsToUser(
        wishlistId,
        process.env.WISHLIST_ALERTS_MY_USER_UUID
      );

    if (!wishlistBelongsToUser) {
      res.status(401).send('Unauthorized');
    }

    const { data: insertItemsData, error: insertItemsError } =
      await this.wishlistService.upsertWishlistItems(
        insertWishlistItems,
        wishlistId
      );

    logger.log(insertItemsData);
    logger.error(insertItemsError);

    res.status(201).json({
      wishlistId: wishlistId,
      wishlist_items: insertItemsData,
    });
  }

  async handleWishlistUpdate(req, res, next) {
    logger.info(`received request: PUT /api/v1/wishlist/:id`);
  }
}

export { WishlistController };
