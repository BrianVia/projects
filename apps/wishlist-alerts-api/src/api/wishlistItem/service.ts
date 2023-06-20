import { PostgrestError, createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import { PriceHistoryService } from '../../services/priceHistory';
import { WishlistItemRepository } from './repository';

const wishlistItemRepository = new WishlistItemRepository();

export interface ParsedWishlistItem {
  itemId: string;
  itemTitle: string;
  itemMaker: string;
  itemHref: string;
  itemCurrentPrice?: number;
  itemImageUrl?: string;
}

export class WishlistItemService {
  public async addNewWishlistItem(
    item: ParsedWishlistItem,
    wishlistId: string
  ): Promise<
    [Database['public']['Tables']['wishlist_items']['Insert'], PostgrestError]
  > {
    const [data, error] = await wishlistItemRepository.insertNewWishlistItem(
      this.mapParsedWishlistItemToDatabaseItem(item, wishlistId)
    );

    return Promise.resolve([data, error]);
  }

  public async addNewWishlistItems(
    items: ParsedWishlistItem[],
    wishlistId: string
  ): Promise<
    [Database['public']['Tables']['wishlist_items']['Insert'][], PostgrestError]
  > {
    const insertItems = items.map((item) =>
      this.mapParsedWishlistItemToDatabaseItem(item, wishlistId)
    );

    const [data, error] = await wishlistItemRepository.upsertWishlistItems(
      insertItems,
      wishlistId
    );

    return Promise.resolve([data, error]);
  }

  public mapParsedWishlistItemToDatabaseItem(
    wishlishItem: ParsedWishlistItem,
    wishlistId: string
  ): Database['public']['Tables']['wishlist_items']['Insert'] {
    return {
      wishlist_id: wishlistId,
      marketplace_item_href: wishlishItem.itemHref,
      marketplace_item_id: wishlishItem.itemId,
      marketplace_item_image_url: wishlishItem.itemImageUrl ?? '',
      marketplace_item_maker: wishlishItem.itemMaker,
      marketplace_item_original_price: wishlishItem.itemCurrentPrice,
      marketplace_item_title: wishlishItem.itemTitle,
      monitored: true,
      update_frequency: 'daily',
    };
  }
}
