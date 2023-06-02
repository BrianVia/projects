import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

import { PostgrestError, createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

export interface ParsedWishlistItem {
  itemId: string;
  itemTitle: string;
  itemMaker: string;
  itemHref: string;
  itemCurrentPrice?: number;
  itemImageUrl?: string;
}

const supabaseClient = createClient<Database>(
  process.env.WISHLIST_ALERTS_SUPABASE_URL,
  process.env.WISHLIST_ALERTS_SUPABASE_SUPER_TOKEN
);

class WishlistService {
  public async parseWishlist(wishlistUrl: string): Promise<{
    wishlistUrl: string;
    wishlistTitle: string;
    wishlishItems: {
      size: number;
      items: ParsedWishlistItem[];
    };
  }> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(wishlistUrl);

    let previousHeight = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(1000); // Adjust the timeout value if needed

      const currentHeight = await page.evaluate(
        () => document.body.scrollHeight
      );
      if (currentHeight === previousHeight) {
        break;
      }
      previousHeight = currentHeight;
    }

    // Get the entire HTML of the page
    const html = await page.content();

    // Parse the HTML using Cheerio
    const $ = cheerio.load(html);

    const wishlistTitle = $('#profile-list-name').text();

    const listContainer = $('ul#g-items');

    const items = listContainer.find('li.g-item-sortable');
    console.log(`Found ${items.length} items`);

    const results: ParsedWishlistItem[] = [];

    items.each((index, item) => {
      const itemId: string = $(item).data('itemid') as string;
      const itemTitle = $(item).find('a.a-link-normal').attr('title') as string;
      //find item by ID and get the maker;

      const itemMaker: string = $(item)
        .find(`#item-byline-${itemId}`)
        .text()
        .replace('by ', '')
        .trim() as string;

      const itemHref = `https://amazon.com${$(item)
        .find('a.a-link-normal')
        .attr('href')}` as string;

      const itemCurrentPrice = $(item)
        .find('span.a-offscreen')
        .text()
        .replace('$', '') as string;

      results.push({
        itemId,
        itemTitle,
        itemMaker,
        itemHref,
        itemCurrentPrice: parseFloat(itemCurrentPrice),
      });
    });

    console.log(`Retrieved ${results.length} items for ${wishlistUrl}`);
    const responseData = {
      wishlistUrl: wishlistUrl,
      wishlistTitle: wishlistTitle,
      wishlishItems: {
        size: results.length,
        items: results,
      },
    };

    await browser.close();

    return Promise.resolve(responseData);
  }

  public async fetchWishlistByUrl(wishlistUrl: string): Promise<{
    data: Database['public']['Tables']['wishlists']['Row'];
    error: PostgrestError;
  }> {
    const { data, error } = await supabaseClient
      .from('wishlists')
      .select('*', { count: 'exact' })
      .eq('wishlist_url', wishlistUrl)
      .limit(1)
      .single();

    return Promise.resolve({ data, error });
  }

  public async fetchWishlistById(
    wishlistId: string
  ): Promise<
    [
      data: Database['public']['Tables']['wishlists']['Row'],
      error: PostgrestError
    ]
  > {
    const { data, error } = await supabaseClient
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
  ): Promise<{
    data: Database['public']['Tables']['wishlists']['Insert'];
    error: PostgrestError;
  }> {
    const { data, error } = await supabaseClient
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

    return Promise.resolve({ data, error });
  }

  public async upsertWishlistItems(
    wishlistItems: Database['public']['Tables']['wishlist_items']['Insert'][],
    wishlistId: string
  ): Promise<{
    data: Database['public']['Tables']['wishlist_items']['Insert'][];
    error: PostgrestError;
  }> {
    const { data, error } = await supabaseClient
      .from('wishlist_items')
      .insert(wishlistItems)
      .select();

    return Promise.resolve({ data, error });
  }

  public async getWishlistItemsByWishlistId(
    wishlistId: string
  ): Promise<
    [Database['public']['Tables']['wishlist_items']['Row'][], PostgrestError]
  > {
    const { data, error } = await supabaseClient
      .from('wishlist_items')
      .select('*')
      .eq('wishlistId', wishlistId);

    return Promise.resolve([data, error]);
  }

  public generateWishlistItemEntities(
    wishlishItems: ParsedWishlistItem[],
    wishlistId: string
  ): Database['public']['Tables']['wishlist_items']['Insert'][] {
    return wishlishItems.map((item) => {
      return {
        wishlistId: wishlistId,
        marketplace_item_href: item.itemHref,
        marketplace_item_id: item.itemId,
        marketplace_item_image_url: item.itemImageUrl ?? '',
        marketplace_item_maker: item.itemMaker,
        marketplace_item_original_price: item.itemCurrentPrice,
        marketplace_item_title: item.itemTitle,
        monitored: true,
        update_frequency: 'daily',
      };
    });
  }

  public async getItemsByWishlistId(
    wishlistId: string
  ): Promise<
    [Database['public']['Tables']['wishlist_items']['Row'][], PostgrestError]
  > {
    const { data, error } = await supabaseClient
      .from('wishlist_items')
      .select('*')
      .eq('wishlistId', wishlistId);

    return Promise.resolve([data, error]);
  }

  public async withlistBelongsToUser(
    wishlistId: string,
    userId: string
  ): Promise<boolean> {
    const { data, error } = await supabaseClient
      .from('wishlists')
      .select('*')
      .eq('id', wishlistId)
      .eq('wishlist_user_id', userId)
      .limit(1)
      .single();

    if (data) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
}

export { WishlistService };
