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

    await allWishlists.forEach(async (wishlist) => {
      console.log(
        `Time: ${Date.now().toLocaleString()} - Analyzing wishlist ${
          wishlist.id
        } - ${wishlist.name}.}`
      );
      const {
        itemsWithPriceCutsBelowThreshold,
        discountThreshold,
        newItemsFound,
      } = await wishlistService.analyzeWishlist(wishlist.id, true);
      console.log(
        `Time: ${Date.now().toLocaleString()} -analyzing wishlist ${
          wishlist.id
        } complete.`
      );
    });

    return Promise.resolve(true);
  }
}

export { MonitoringService };
