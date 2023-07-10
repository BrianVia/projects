import { WishlistRepository } from '../../api/wishlist/repository';
import { WishlistService } from '../../api/wishlist/service';
import { UpdateFrequency } from '../../types/updateFrequency';

import winston from 'winston';
const logger = winston.createLogger({
  level: process.env.WISHLIST_ALERTS_LOG_LEVEL || 'info',
  format: winston.format.json(),
});
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const wishlistService = new WishlistService();
const wishlistRepository = new WishlistRepository();

class MonitoringService {
  public async monitorWishlists(
    updateFrequency: UpdateFrequency
  ): Promise<boolean> {
    logger.info('monitoring wishlists');

    // get all wishlists
    const [allWishlists, allWishlistsError] =
      await wishlistRepository.getAllWishlists();

    const allDonePromises = [];
    for (const wishlist of allWishlists) {
      logger.info(
        `Time: ${new Date().toLocaleString()} - Analyzing wishlist ${
          wishlist.id
        } - ${wishlist.name}`
      );
      const {
        itemsWithPriceCutsBelowThreshold,
        discountThreshold,
        newItemsFound,
      } = await wishlistService.analyzeWishlistItems(wishlist.id, true);
      logger.info(
        `Time: ${new Date().toLocaleString()} -analyzing wishlist ${
          wishlist.id
        } complete.`
      );

      // TODO send results to user

      allDonePromises.push(Promise.resolve(true));
      logger.info(
        'All done with wishlist ID: ' + wishlist.id + ' - ' + wishlist.name
      );
    }

    const allDone = (await Promise.all(allDonePromises)).every(
      (prom) => prom === true
    );
    logger.info('All monitoring jobs jobs are done');
    return Promise.resolve(allDone);
  }
}

export { MonitoringService };
