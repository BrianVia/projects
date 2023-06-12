import { WishlistService } from '../../api/wishlist/service';
import { UpdateFrequency } from '../../types/updateFrequency';

const wishlistService = new WishlistService();

class MonitoringService {
  public async monitorWishlists(
    updateFrequency: UpdateFrequency
  ): Promise<boolean> {
    console.log('monitoring wishlists');

    // get all wishlists
    const [allWishlists, allWishlistsError] =
      await wishlistService.getAllWishlists();

    const allDonePromises = [];
    for (const wishlist of allWishlists) {
      console.log(
        `Time: ${new Date().toLocaleString()} - Analyzing wishlist ${
          wishlist.id
        } - ${wishlist.name}`
      );
      const {
        itemsWithPriceCutsBelowThreshold,
        discountThreshold,
        newItemsFound,
      } = await wishlistService.analyzeWishlist(wishlist.id, true);
      console.log(
        `Time: ${new Date().toLocaleString()} -analyzing wishlist ${
          wishlist.id
        } complete.`
      );

      // TODO send results to user

      allDonePromises.push(Promise.resolve(true));
      console.log(
        'All done with wishlist ID: ' + wishlist.id + ' - ' + wishlist.name
      );
    }

    const allDone = (await Promise.all(allDonePromises)).every(
      (prom) => prom === true
    );
    console.log('All monitoring jobs jobs are done');
    return Promise.resolve(allDone);
  }
}

export { MonitoringService };
