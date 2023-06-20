import {
  createClient,
  PostgrestError,
  SupabaseClient,
} from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

class WishlistItemRepository {
  private supabaseClient: SupabaseClient<Database>;

  constructor() {
    this.supabaseClient = createClient<Database>(
      process.env.WISHLIST_ALERTS_SUPABASE_URL,
      process.env.WISHLIST_ALERTS_SUPABASE_SUPER_TOKEN
    );
  }

  public async upsertWishlistItems(
    wishlistItems: Database['public']['Tables']['wishlist_items']['Insert'][],
    wishlistId: string
  ): Promise<
    [Database['public']['Tables']['wishlist_items']['Insert'][], PostgrestError]
  > {
    const { data, error } = await this.supabaseClient
      .from('wishlist_items')
      .insert(wishlistItems)
      .select();

    return Promise.resolve([data, error]);
  }

  public async getWishlistItemsByWishlistId(
    wishlistId: string
  ): Promise<
    [Database['public']['Tables']['wishlist_items']['Row'][], PostgrestError]
  > {
    const { data, error } = await this.supabaseClient
      .from('wishlist_items')
      .select('*')
      .eq('wishlistId', wishlistId);

    return Promise.resolve([data, error]);
  }

  public async getItemsByWishlistId(
    wishlistId: string
  ): Promise<
    [Database['public']['Tables']['wishlist_items']['Row'][], PostgrestError]
  > {
    const { data, error } = await this.supabaseClient
      .from('wishlist_items')
      .select('*')
      .eq('wishlist_id', wishlistId);

    return Promise.resolve([data, error]);
  }
}

export { WishlistItemRepository };
