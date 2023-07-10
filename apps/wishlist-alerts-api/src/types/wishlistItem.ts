export interface WishlistItem  {
  id: string;
  marketplace_item_title: string;
  marketplace_item_maker: string;
  marketplace_item_original_price: number;
  marketplace_item_href: string;
  marketplace_item_image_url: string;
  referral_link: string;
  item_latest_price: number;
  item_lowest_price: number;
  current_discount_percentage: number;
};

export interface WishlistWithItemsWithPriceInfo  {
  wishlist_id: string;
  wishlist_name: string;
  wishlist_url: string;
  monitored: boolean;
  initialized: boolean;
  update_frequency: number;
  created_at: string;
  last_updated_at: string;
  wishlist_items: WishlistItem[];
};

export interface ParsedWishlistItem {
  itemId: string;
  itemTitle: string;
  itemMaker: string;
  itemHref: string;
  itemCurrentPrice?: number;
  itemImageUrl?: string;
}