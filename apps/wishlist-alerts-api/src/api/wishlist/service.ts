import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

import { PostgrestError, createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

export interface ParsedWishlistItem {
  itemId: string;
  itemTitle: string;
  itemMaker: string;
  itemHref: string;
  itemCurrentPrice?: string;
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
        itemCurrentPrice,
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

  public async fetchWishlist(wishlistUrl: string): Promise<{
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
}

export { WishlistService };
