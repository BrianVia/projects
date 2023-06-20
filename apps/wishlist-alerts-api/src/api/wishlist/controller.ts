import { Logger } from '@common/logger';
import { WishlistService } from './service';
import { PriceHistoryService } from '../../services/priceHistory';

import { Database } from '../../types/supabase';
import { AuthService } from '../../lib/auth';
import { NextFunction, Request, Response } from 'express';
import { val } from 'cheerio/lib/api/attributes';

const logger = new Logger();
const wishlistService = new WishlistService();
const authService = new AuthService();
const priceHistoryService = new PriceHistoryService();

class WishlistController {
  async handlePostNewWishlist(req: Request, res: Response, next: NextFunction) {
    logger.info(`received request: POST /api/v1/wishlist/new`);
    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   logger.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    const wishlistUrl: string = req.body.wishlistUrl as string;

    if (!wishlistUrl.startsWith(`https://www.amazon.com/hz/wishlist/`)) {
      res.status(400).json('invalid wishlist url');
    }

    const addAllItems: boolean = req.body.addAllItems as boolean;
    logger.debug(`wishlistUrl: ${wishlistUrl}`);
    const wishlistData = await wishlistService.parseWishlist(wishlistUrl);

    const { data: existingWishlistData, error: fetchWishlistError } =
      await wishlistService.fetchWishlistByUrl(wishlistUrl);

    if (existingWishlistData !== null) {
      logger.info(`wishlist already exists in database`);
      //insert any new items if needed
      // update any wishlist properties?

      return res.status(400).json('wishlist already exists');
    } else {
      logger.info(`wishlist does not exist in database`);
      const { data: insertWishlistData, error: insertError } =
        await wishlistService.insertNewWishlist(
          wishlistData.wishlistUrl,
          process.env.WISHLIST_ALERTS_MY_USER_UUID,
          wishlistData.wishlistTitle
        );

      const insertWishlistItems = wishlistService.generateWishlistItemEntities(
        wishlistData.wishlishItems.items,
        insertWishlistData.id
      );

      if (addAllItems) {
        const { data: insertItemsData, error: insertItemsError } =
          await wishlistService.upsertWishlistItems(
            insertWishlistItems,
            insertWishlistData.id
          );

        console.log(insertItemsData);
        console.error(insertItemsError);
      }

      res.status(201).json({
        ...insertWishlistData,
        wishlist_items: wishlistData.wishlishItems,
      });
    }
  }

  async handlePostWishlistItems(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   logger.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    logger.info(`received request: POST /api/v1/wishlist/items`);

    const insertWishlistItems = req.body
      .wishlistItems as Database['public']['Tables']['wishlist_items']['Insert'][];
    const wishlistId = req.body.wishlistId as string;
    const wishlistBelongsToUser = await wishlistService.withlistBelongsToUser(
      wishlistId,
      process.env.WISHLIST_ALERTS_MY_USER_UUID
    );

    if (!wishlistBelongsToUser) {
      res.status(401).send('Unauthorized');
    }

    const { data: insertItemsData, error: insertItemsError } =
      await wishlistService.upsertWishlistItems(
        insertWishlistItems,
        wishlistId
      );

    logger.log(insertItemsData);
    logger.error(insertItemsError);

    res.status(201).json({
      wishlistId: wishlistId,
      wishlist_items: insertItemsData,
    });
  }

  async handleGetWishlistItems(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    logger.info(
      `received request: GET /api/v1/wishlist/${req.params.id}/items`
    );

    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   logger.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    const wishlistId = req.params.id;

    const wishlistBelongsToUser = await wishlistService.withlistBelongsToUser(
      wishlistId,
      process.env.WISHLIST_ALERTS_MY_USER_UUID //replace with token user id
    );

    if (!wishlistBelongsToUser) {
      res.status(401).send('Unauthorized');
    }

    const [wishlistItems, wishlistItemsError] =
      await wishlistService.getItemsByWishlistId(wishlistId);

    if (wishlistItemsError) {
      logger.error(wishlistItemsError);
      res.status(500).json({ error: wishlistItemsError });
    }

    res.status(200).json({ wishlistItems });
  }

  async handleWishlistUpdate(req: Request, res: Response, next: NextFunction) {
    logger.info(`received request: PUT /api/v1/wishlist/:id`);
  }

  async handleWishlistAnalyzeItems(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    logger.info(
      `received request: POST /api/v1/wishlist/${req.params.id}/analyze`
    );

    const wishlistId = req.params.id;

    const addNewItemsFound = (req.body.addNewItemsFound as boolean) ?? true;

    const {
      itemsWithPriceCutsBelowThreshold,
      discountThreshold,
      newItemsFound,
    } = await wishlistService.analyzeWishlistItems(
      wishlistId,
      addNewItemsFound
    );

    res.status(200).json({
      itemsWithPriceCutsBelowThreshold,
      discountThreshold,
      newItemsFound,
    });
  }

  async handleGetWishlistCurrentDiscounts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    logger.info(
      `received request: GET /api/v1/wishlist/${req.params.id}/discounts`
    );

    const wishlistId = req.params.id;

    const [wishlistItems, wishlistItemsError] =
      await wishlistService.getItemsByWishlistId(wishlistId);

    // console.log(wishlistItems);

    const wishlistItemsMap = new Map<
      string,
      Database['public']['Tables']['wishlist_items']['Row']
    >();
    wishlistItems.forEach((item) => {
      wishlistItemsMap.set(item.id, item);
    });

    const itemsWithLatestPrices = wishlistItems
      .filter(
        (item) =>
          item.marketplace_item_original_price !== null &&
          item.marketplace_item_original_price !== undefined &&
          !Number.isNaN(item.marketplace_item_original_price)
      )
      .map(async (item) => {
        const [itemLatestPrice, itemsLatestPriceError] =
          await priceHistoryService.getItemLatestPrice(item.id);
        if (itemsLatestPriceError) {
          console.error(itemsLatestPriceError);
          return {
            ...item,
            latest_price: item.marketplace_item_original_price ?? null,
            discount_percentage: 0,
          };
        } else {
          return {
            ...item,
            latest_price: itemLatestPrice.price,
            discount_percentage: itemLatestPrice.discount_percentage,
          };
        }
      });

    const finalItems = await Promise.all(itemsWithLatestPrices);

    const finalDiscountedItems = finalItems
      .filter((item) => item.discount_percentage > 20)
      .sort((a, b) => b.discount_percentage - a.discount_percentage);
    res.status(200).json({ discountedItems: finalDiscountedItems });
  }

  async handleAnalyzeAllWishlists(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.log('test');
  }

  async handleGetAllUserWishlists(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   logger.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    const userId = process.env.WISHLIST_ALERTS_MY_USER_UUID;

    logger.info(`received request: GET /api/v1/wishlists/user/${userId}`);

    const [userWishlists, fetchWishlistsError] =
      await wishlistService.getAllUserWishlists(userId);

    if (fetchWishlistsError) {
      logger.error(fetchWishlistsError);
      res.status(500).json({ error: fetchWishlistsError });
    }
    res.status(200).json({ wishlists: userWishlists });
  }
}

export { WishlistController };
