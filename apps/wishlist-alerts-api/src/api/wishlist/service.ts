import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { randomUUID } from 'crypto';

interface WishlistResult {
  itemId: string;
  itemTitle: string;
  itemMaker: string;
  itemHref: string;
  itemCurrentPrice?: string;
  itemImageUrl?: string;
}

class WishlistService {
  public async parseWishlist(wishlistUrl: string): Promise<{
    wishlistUrl: string;
    wishlishItems: {
      size: number;
      items: WishlistResult[];
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

    const listContainer = $('ul#g-items');

    const items = listContainer.find('li.g-item-sortable');
    console.log(`Found ${items.length} items`);

    const results: WishlistResult[] = [];

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

      const itemCurrentPrice = $(item).find('span.a-offscreen').text();

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
      wishlishItems: {
        size: results.length,
        items: results,
      },
    };

    await browser.close();

    return Promise.resolve(responseData);
  }
}

export { WishlistService };
