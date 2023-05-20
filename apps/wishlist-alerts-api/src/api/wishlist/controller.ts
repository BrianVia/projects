import { PostgrestError } from '@supabase/supabase-js';
import { Logger } from '@wordly-domains/logger';
import { WishlistService } from './service';
import { createClient } from '@supabase/supabase-js';

import { Database } from '../../types/supabase';
import { randomUUID } from 'crypto';

const logger = new Logger();
const wishlistService = new WishlistService();
const supabaseClient = createClient<Database>(
  process.env.WISHLIST_ALERTS_SUPABASE_URL,
  process.env.WISHLIST_ALERTS_SUPABASE_SUPER_TOKEN
);

class WishlistController {
  async handlePostNewWishlist(req, res, next) {
    logger.info(`received request: POST /api/v1/wishlist/new`);
    // const token = req.headers.authorization;
    // const tokenUser = await getTokenUser(token);
    // if (tokenUser) {
    //     logger.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //     logger.warn(`token user not found`);
    //     res.status(401).send('Unauthorized');
    // }

    const wishlistUrl = req.body.wishlistUrl;
    logger.debug(`wishlistUrl: ${wishlistUrl}`);
    const wishlistData = await wishlistService.parseWishlist(wishlistUrl);

    const { data, error } = await supabaseClient
      .from('wishlists')
      .upsert({
        wishlist_url: wishlistUrl,
        wishlist_user_id: '553c9eca-29ee-4141-ae31-74ad4d2a2c10',
        monitored: true,
        initialized: true,
        update_frequency: 'daily',
      })
      .select();

    if (error) {
      logger.error(error.toString());
    }

    console.log(data);
    console.error(error);
    res.status(200).json({
      wishlistItems: wishlistData.wishlishItems,
      ...data['0'],
    });
  }

  async persistWishlist() {
    // Create a single supabase client for interacting with your database
  }
}

export { WishlistController };
