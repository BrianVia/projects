import {
  createClient,
  PostgrestError,
  SupabaseClient,
} from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

class WishlistRepository {
  private supabaseClient: SupabaseClient<Database>;

  constructor() {
    this.supabaseClient = createClient<Database>(
      process.env.WISHLIST_ALERTS_SUPABASE_URL,
      process.env.WISHLIST_ALERTS_SUPABASE_SUPER_TOKEN
    );
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
}

export { WishlistRepository };
