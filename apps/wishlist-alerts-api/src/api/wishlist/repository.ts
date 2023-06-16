import {
  createClient,
  PostgrestError,
  SupabaseClient,
} from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

import { Pool } from 'pg';

class WishlistRepository {
  private supabaseClient: SupabaseClient<Database>;
  private pool: Pool;

  constructor() {
    this.supabaseClient = createClient<Database>(
      process.env.WISHLIST_ALERTS_SUPABASE_URL,
      process.env.WISHLIST_ALERTS_SUPABASE_SUPER_TOKEN
    );

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
    const { data, error } = await this.supabaseClient
      .from('wishlists')
      .select('*');
    return Promise.resolve([data, error]);
  }

  public async fetchWishlistByUrl(
    wishlistUrl: string
  ): Promise<
    [Database['public']['Tables']['wishlists']['Row'], PostgrestError]
  > {
    const { data, error } = await this.supabaseClient
      .from('wishlists')
      .select('*', { count: 'exact' })
      .eq('wishlist_url', wishlistUrl)
      .limit(1)
      .single();

    return Promise.resolve([data, error]);
  }

  public async fetchWishlistById(
    wishlistId: string
  ): Promise<
    [
      data: Database['public']['Tables']['wishlists']['Row'],
      error: PostgrestError
    ]
  > {
    const { data, error } = await this.supabaseClient
      .from('wishlists')
      .select('*')
      .eq('id', wishlistId)
      .limit(1)
      .single();

    return Promise.resolve([data, error]);
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
    const { data, error } = await this.supabaseClient
      .from('wishlists')
      .insert({
        wishlist_url: wishlistUrl,
        wishlist_user_id: wishlistUserId,
        monitored: monitored,
        initialized: initialized,
        update_frequency: updateFrequency,
        name: wishlistName,
      })
      .select()
      .limit(1)
      .single();

    return Promise.resolve([data, error]);
  }

  public async getAllUserWishlists(
    userId: string
  ): Promise<
    [Database['public']['Tables']['wishlists']['Row'][], PostgrestError]
  > {
    const { data: userWishlists, error } = await this.supabaseClient
      .from('wishlists')
      .select('*')
      .eq('wishlist_user_id', userId);

    return Promise.resolve([userWishlists, error]);
  }

  public async getAllUserWishlistsWithItems(
    userId: string
  ): Promise<
    [Database['public']['Tables']['wishlists']['Row'][], PostgrestError]
  > {
    const { data: userWishlists, error } = await this.supabaseClient
      .from('wishlists')
      .select('*, wishlist_items (*)')
      .eq('wishlist_user_id', userId);

    return Promise.resolve([userWishlists, error]);
  }

  public async getAllUserWishlistsWithItemsAndRecords(
    userId: string
  ): Promise<
    [Database['public']['Tables']['wishlists']['Row'][], PostgrestError]
  > {
    const { data: userWishlists, error } = await this.supabaseClient
      .from('wishlists')
      .select('*, wishlist_items (*, price_history(*))')
      .eq('wishlist_user_id', userId);

    return Promise.resolve([userWishlists, error]);
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
      wishlistId: string;
      discount_percentage: number | null;
      item_id: string | null;
      price: number;
    }[]
  > {
    try {
      const wishlistQuery = `
        SELECT wi.*, ph.*
        FROM wishlist_items wi
        JOIN (
          SELECT item_id, MAX(created_at) AS latest_created_at
          FROM price_history
          GROUP BY item_id
        ) latest_ph ON wi.id = latest_ph.item_id
        JOIN price_history ph ON latest_ph.item_id = ph.item_id AND latest_ph.latest_created_at = ph.created_at
        WHERE wi."wishlistId" = '${wishlistId}';
      `;

      console.log(`query: ${wishlistQuery}`);

      const client = await this.pool.connect();
      const res = await client.query(wishlistQuery);
      console.log(`Found ${res.rows.length} records`);
      client.release(); // Release the connection back to the pool
      return Promise.resolve(res.rows);
    } catch (error) {
      console.error('Error executing query:', error);
      return [];
    }
  }
}

export { WishlistRepository };
