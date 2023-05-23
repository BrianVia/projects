import { PostgrestError } from '@supabase/supabase-js';
import { Logger } from '@common/logger';
import { WishlistService } from './service';
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
    const token = req.headers.authorization;
    const tokenUser = await authService.getTokenUser(token);
    if (tokenUser) {
      logger.debug(`token user found: ${tokenUser?.id}`);
    } else {
      logger.warn(`token user not found`);
      res.status(401).send('Unauthorized');
    }

    const wishlistUrl = req.body.wishlistUrl;
    logger.debug(`wishlistUrl: ${wishlistUrl}`);
    const wishlistData = await wishlistService.parseWishlist(wishlistUrl);

    const { data: fetchData, error: fetchError } = await supabaseClient
      .from('wishlists')
      .select('*', { count: 'exact' })
      .eq('wishlist_url', wishlistUrl);

    if (fetchData.length > 0) {
      //insert any new items if needed

      res.status(200).json({
        ...fetchData['0'],
        wishlistItems: wishlistData.wishlishItems,
      });
      return;
    }

    const { data: insertData, error: insertError } = await supabaseClient
      .from('wishlists')
      .insert({
        wishlist_url: wishlistUrl,
        wishlist_user_id: tokenUser.id,
        monitored: true,
        initialized: true,
        update_frequency: 'daily',
      })
      .select();

    console.log(insertData);
    console.error(insertError);
    res.status(200).json({
      ...insertData['0'],
      wishlist_items: wishlistData.wishlishItems,
    });
  }

  async persistWishlist() {
    // Create a single supabase client for interacting with your database
  }
}

export { WishlistController };
