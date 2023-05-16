import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

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
    statusCode: number;
    response: {
      data: WishlistResult[];
      size: number;
    };
  }> {
    const wishlist_url =
      'https://www.amazon.com/hz/wishlist/ls/27RORQ2D4ZEPH?ref_=wl_share';

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(wishlist_url);

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

    console.log(`Found ${results.length} items`);
    const response = {
      statusCode: 200,
      response: {
        size: results.length,
        data: results,
      },
    };

    console.table(results);
    console.log(`Found ${results.length} items`);

    await browser.close();

    return Promise.resolve(response);
  }
}

export { WishlistService };
