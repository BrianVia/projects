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
  defaultMeta: { service: 'wishlist-alerts-api' },
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

  public async getAllUserWishlistsWithItems(
    userId: string
  ): Promise<
    [Database['public']['Tables']['wishlists']['Row'][], PostgrestError]
  > {
    try {
      const query = `
        SELECT w.*, wi.*
        FROM wishlists w
        JOIN wishlist_items wi ON w.id = wi.wishlist_id
        WHERE w.wishlist_user_id = $1
      `;
      const res = await this.pool.query(query, [userId]);
      return Promise.resolve([res.rows, null]);
    } catch (error) {
      return Promise.reject([null, error]);
    }
  }

  public async getAllUserWishlistsWithItemsAndRecords(
    userId: string
  ): Promise<
    Database['public']['Tables']['wishlists']['Row'][] | PostgrestError
  > {
    try {
      const query = `
        SELECT w.*, wi.*, ph.*
        FROM wishlists w
        JOIN wishlist_items wi ON w.id = wi.wishlist_id
        JOIN (
          SELECT item_id, MAX(created_at) AS latest_created_at
          FROM price_history
          GROUP BY item_id
        ) latest_ph ON wi.id = latest_ph.item_id
        JOIN price_history ph ON latest_ph.item_id = ph.item_id AND latest_ph.latest_created_at = ph.created_at
        WHERE w.wishlist_user_id = $1
      `;
      const res = await this.pool.query(query, [userId]);
      return Promise.resolve(res.rows);
    } catch (error) {
      return Promise.resolve(error);
    }
  }

  public async getWishlistItemsAndDiscounts(wishlistId: string): Promise<
    {
      created_at: string | null;
      id: string;
      last_updated_at: string | null;
      marketplace_item_href: string;
      marketplace_item_id: string;
      marketplace_item_image_url: string | null;
      marketplace_item_maker: string;
      marketplace_item_original_price: number | null;
      marketplace_item_title: string;
      monitored: boolean;
      referral_link: string | null;
      update_frequency: string | null;
      wishlist_id: string;
      discount_percentage: number | null;
      item_id: string | null;
      price: number;
    }[]
  > {
    try {
      const query = `
        SELECT wi.*, ph.*
        FROM wishlist_items wi
        JOIN (
          SELECT item_id, MAX(created_at) AS latest_created_at
          FROM price_history
          GROUP BY item_id
        ) latest_ph ON wi.id = latest_ph.item_id
        JOIN price_history ph ON latest_ph.item_id = ph.item_id AND latest_ph.latest_created_at = ph.created_at
        WHERE wi.wishlist_id = $1
      `;
      const res = await this.pool.query(query, [wishlistId]);
      return Promise.resolve(res.rows);
    } catch (error) {
      logger.error('Error executing query:', error);
      return Promise.reject(error);
    }
  }
}

export { WishlistRepository };
