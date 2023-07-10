import {
  createClient,
  PostgrestError,
  SupabaseClient,
} from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

import { Pool } from 'pg';

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

class WishlistRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      password: process.env.WISHLIST_ALERTS_DB_PASSWORD,
      host: 'db.cxyzkjrqsbeyafkgokgt.supabase.co',
      port: 6543,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }, // Needed for Supabase
      max: 10, // Maximum number of connections in the pool
    });
  }

  public async getAllWishlists(): Promise<
    [Database['public']['Tables']['wishlists']['Row'][], PostgrestError]
  > {
    try {
      const query = 'SELECT * FROM wishlists';
      const res = await this.pool.query(query);
      return Promise.resolve([res.rows, null]);
    } catch (error) {
      return Promise.reject([null, error]);
    }
  }

  public async fetchWishlistByUrl(
    wishlistUrl: string
  ): Promise<
    [Database['public']['Tables']['wishlists']['Row'], PostgrestError]
  > {
    try {
      const query = `SELECT * FROM wishlists WHERE wishlist_url = $1 LIMIT 1`;
      const res = await this.pool.query(query, [wishlistUrl]);
      return Promise.resolve([res.rows[0], null]);
    } catch (error) {
      return Promise.resolve([null, error]);
    }
  }

  public async fetchWishlistById(
    wishlistId: string
  ): Promise<
    [
      data: Database['public']['Tables']['wishlists']['Row'],
      error: PostgrestError
    ]
  > {
    try {
      const query = `SELECT * FROM wishlists WHERE id = $1 LIMIT 1`;
      const res = await this.pool.query(query, [wishlistId]);
      return Promise.resolve([res.rows[0], null]);
    } catch (error) {
      return Promise.resolve([null, error]);
    }
  }

  public async insertNewWishlist(
    wishlistUrl: string,
    wishlistUserId: string,
    wishlistName: string,
    monitored = true,
    initialized = true,
    updateFrequency = 'daily'
  ): Promise<
    [Database['public']['Tables']['wishlists']['Insert'], PostgrestError]
  > {
    try {
      const query = `
        INSERT INTO wishlists (wishlist_url, wishlist_user_id, monitored, initialized, update_frequency, name)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [
        wishlistUrl,
        wishlistUserId,
        monitored,
        initialized,
        updateFrequency,
        wishlistName,
      ];
      const res = await this.pool.query(query, values);
      return Promise.resolve([res.rows[0], null]);
    } catch (error) {
      return Promise.resolve([null, error]);
    }
  }

  public async getAllUserWishlists(
    userId: string
  ): Promise<
    [Database['public']['Tables']['wishlists']['Row'][], PostgrestError]
  > {
    try {
      const query = `SELECT * FROM wishlists WHERE wishlist_user_id = $1`;
      const res = await this.pool.query(query, [userId]);
      return Promise.resolve([res.rows, null]);
    } catch (error) {
      return Promise.resolve([null, error]);
    }
  }

  public async getAllUserWishlistsWithItemsAnd(
    userId: string
  ): Promise<
    [Database['public']['Tables']['wishlists']['Row'][], PostgrestError]
  > {
    try {
      const query = `SELECT w.id as wishlist_id, 
       w.name as wishlist_name, 
       w.wishlist_url,
       w.monitored,
       w.initialized,
       w.update_frequency,
       w.created_at as created_at,
       w.last_updated_at as last_updated_at,
       array_agg(
            jsonb_build_object(
                'id', wi.id,
                'marketplace_item_title', wi.marketplace_item_title,
                'marketplace_item_maker', wi.marketplace_item_maker,
                'marketplace_item_original_price', wi.marketplace_item_original_price,
                'marketplace_item_href', wi.marketplace_item_href,
                'marketplace_item_image_url', wi.marketplace_item_image_url,
                'referral_link', wi.referral_link, 
                'item_latest_price', (
                    SELECT ph.price
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.created_at DESC
                    LIMIT 1
                ),
                'item_lowest_price', (
                    SELECT ph.price
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.price ASC
                    LIMIT 1
                ),
                'current_discount_percentage', (
                    SELECT ph.discount_percentage
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.created_at DESC
                    LIMIT 1
                )
            )
       ) as wishlist_items
FROM wishlists w
JOIN wishlist_items wi ON w.id = wi.wishlist_id
WHERE w.wishlist_user_id = $1
GROUP BY w.id;`;
      const res = await this.pool.query(query, [userId]);
      return Promise.resolve([res.rows, null]);
    } catch (error) {
      return Promise.reject([null, error]);
    }
  }

  public async getAllUserWishlistsWithItemsAndDiscounts(
    userId: string
  ): Promise<[WishlistWithItemsWithPriceInfo[], PostgrestError]> {
    try {
      const query = `SELECT w.id as wishlist_id, 
       w.name as wishlist_name, 
       w.wishlist_url,
       w.monitored,
       w.initialized,
       w.update_frequency,
       w.created_at as created_at,
       w.last_updated_at as last_updated_at,
       array_agg(
            jsonb_build_object(
                'id', wi.id,
                'marketplace_item_title', wi.marketplace_item_title,
                'marketplace_item_maker', wi.marketplace_item_maker,
                'marketplace_item_original_price', wi.marketplace_item_original_price,
                'marketplace_item_href', wi.marketplace_item_href,
                'marketplace_item_image_url', wi.marketplace_item_image_url,
                'referral_link', wi.referral_link, 
                'item_latest_price', (
                    SELECT ph.price
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.created_at DESC
                    LIMIT 1
                ),
                'item_lowest_price', (
                    SELECT ph.price
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.price ASC
                    LIMIT 1
                ),
                'current_discount_percentage', (
                    SELECT ph.discount_percentage
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.created_at DESC
                    LIMIT 1
                )
            )
       ) as wishlist_items
FROM wishlists w
JOIN wishlist_items wi ON w.id = wi.wishlist_id
WHERE w.wishlist_user_id = '553c9eca-29ee-4141-ae31-74ad4d2a2c10'
GROUP BY w.id;
`;
      const res = await this.pool.query(query, [userId]);
      return Promise.resolve([res.rows, null]);
    } catch (error) {
      return Promise.resolve([null, error]);
    }
  }

  public async getWishlistItemsAndDiscounts(
    wishlistId: string
  ): Promise<WishlistWithItemsWithPriceInfo> {
    try {
      const query = `SELECT w.id as wishlist_id, 
       w.name as wishlist_name, 
       w.wishlist_url,
       w.monitored,
       w.initialized,
       w.update_frequency,
       w.created_at as created_at,
       w.last_updated_at as last_updated_at,
       array_agg(
            jsonb_build_object(
                'id', wi.id,
                'marketplace_item_title', wi.marketplace_item_title,
                'marketplace_item_maker', wi.marketplace_item_maker,
                'marketplace_item_original_price', wi.marketplace_item_original_price,
                'marketplace_item_href', wi.marketplace_item_href,
                'marketplace_item_image_url', wi.marketplace_item_image_url,
                'referral_link', wi.referral_link, 
                'item_latest_price', (
                    SELECT ph.price
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.created_at DESC
                    LIMIT 1
                ),
                'item_lowest_price', (
                    SELECT ph.price
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.price ASC
                    LIMIT 1
                ),
                'current_discount_percentage', (
                    SELECT ph.discount_percentage
                    FROM price_history ph
                    WHERE ph.item_id = wi.id
                    ORDER BY ph.created_at DESC
                    LIMIT 1
                )
            )
       ) as wishlist_items
      FROM wishlists w
      JOIN wishlist_items wi ON w.id = wi.wishlist_id
      WHERE w.id = $1
      GROUP BY w.id;`;
      const res = await this.pool.query(query, [wishlistId]);
      return Promise.resolve(res.rows);
    } catch (error) {
      logger.error('Error executing query:', error);
      return Promise.reject(error);
    }
  }
}

type WishlistItem = {
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

type WishlistWithItemsWithPriceInfo = {
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

export { WishlistRepository };
