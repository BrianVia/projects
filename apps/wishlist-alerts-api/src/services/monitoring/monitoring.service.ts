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

    allWishlists.forEach(async (wishlist) => {
      const {
        itemsWithPriceCutsBelowThreshold,
        discountThreshold,
        newItemsFound,
      } = await wishlistService.analyzeWishlist(wishlist.id, true);
    });

    return Promise.resolve(true);
  }
}

export { MonitoringService };
