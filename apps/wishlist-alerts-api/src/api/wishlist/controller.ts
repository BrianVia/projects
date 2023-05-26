import { PostgrestError } from '@supabase/supabase-js';
import { Logger } from '@common/logger';
import { ParsedWishlistItem, WishlistService } from './service';
import { createClient } from '@supabase/supabase-js';

import { Database } from '../../types/supabase';
import { AuthService } from '../../lib/auth';

const logger = new Logger();
const wishlistService = new WishlistService();
const supabaseClient = createClient<Database>(
  process.env.WISHLIST_ALERTS_SUPABASE_URL,
  process.env.WISHLIST_ALERTS_SUPABASE_SUPER_TOKEN
);
const authService = new AuthService();

class WishlistController {
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
    const wishlistData = await wishlistService.parseWishlist(wishlistUrl);

    const { data: existingWishlistData, error: fetchWishlistError } =
      await wishlistService.fetchWishlist(wishlistUrl);

    if (existingWishlistData.id !== undefined) {
      logger.info(`wishlist already exists in database`);
      //insert any new items if needed
      // update any wishlist properties?

      return res.status(200).json({
        ...existingWishlistData,
        already_exists: true,
      });
    } else {
      logger.info(`wishlist does not exist in database`);
      const { data: insertWishlistData, error: insertError } =
        await wishlistService.insertNewWishlist(
          wishlistData.wishlistUrl,
          process.env.WISHLIST_ALERTS_MY_USER_UUID,
          wishlistData.wishlistTitle
        );

      const insertWishlistItems = wishlistService.generateWishlistItemEntities(
        wishlistData,
        insertWishlistData.id
      );

      if (addAllItems) {
        const { data: insertItemsData, error: insertItemsError } =
          await wishlistService.upsertWishlistItems(
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
    console.log(req);
  }
}

export { WishlistController };
