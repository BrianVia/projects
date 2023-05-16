import { PostgrestError } from '@supabase/supabase-js';
import { Logger } from '@wordly-domains/logger';
import { WishlistService } from './service';

const logger = new Logger();
const wishlistService = new WishlistService();

class WishlistController {
  async handleWishlistPost(req, res, next) {
    logger.info(`received request: POST /api/wishlist/new`);
    // const token = req.headers.authorization;
    // const tokenUser = await getTokenUser(token);
    // if (tokenUser) {
    //     logger.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //     logger.warn(`token user not found`);
    //     res.status(401).send('Unauthorized');
    // }
    const wishlistUrl = req.body.wishlistUrl;
    const data = await wishlistService.parseWishlist(wishlistUrl);

    res.status(200).json(data);
  }
}

export { WishlistController };
