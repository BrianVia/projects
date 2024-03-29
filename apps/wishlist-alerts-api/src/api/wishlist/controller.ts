import { WishlistService } from './service';
import { PriceHistoryService } from '../../services/priceHistory';
import { WishlistItemService } from '../wishlistItem/service';
import { Database } from '../../types/supabase';
import { AuthService } from '../../lib/auth';
import { NextFunction, Request, Response } from 'express';
import winston from 'winston';
import { WishlistItemRepository } from '../wishlistItem/repository';
import { PostgrestError } from '@supabase/supabase-js';

const logger = winston.createLogger({
  level: process.env.WISHLIST_ALERTS_LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
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

const wishlistService = new WishlistService();
const wishlistItemService = new WishlistItemService();
const authService = new AuthService();
const priceHistoryService = new PriceHistoryService();

export interface InsertPriceHistoryRecordPartialPayload {
  itemId: string;
  itemPrice: number;
  discountPercentage?: number;
}

class WishlistController {
  async handlePostNewWishlist(req: Request, res: Response) {
    console.log(`received request: POST /api/v1/wishlist/new`);
    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   console.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    const wishlistUrl: string = req.body.wishlistUrl as string;

    if (!wishlistUrl.startsWith(`https://www.amazon.com/hz/wishlist/`)) {
      res.status(400).json('invalid wishlist url');
    }

    const addAllItems: boolean = req.body.addAllItems as boolean;
    console.debug(`wishlistUrl: ${wishlistUrl}`);
    const wishlistData = await wishlistService.parseWishlist(wishlistUrl);

    // Find if wishlsit already exists
    const { data: existingWishlistData, error: fetchWishlistError } =
      await wishlistService.fetchWishlistByUrl(wishlistUrl);

    if (existingWishlistData !== null) {
      console.log(`wishlist already exists in database`);
      //insert any new items if needed
      // update any wishlist properties?

      return res.status(400).json('wishlist already exists');
    } else {
      console.log(`wishlist does not exist in database`);
      const { data: insertWishlistData, error: insertError } =
        await wishlistService.insertNewWishlist(
          wishlistData.wishlistUrl,
          process.env.WISHLIST_ALERTS_MY_USER_UUID,
          wishlistData.wishlistTitle
        );

      if (addAllItems) {
        //prepare DB records to insert
        const insertWishlistItems =
          wishlistService.generateWishlistItemEntities(
            wishlistData.wishlishItems.items,
            insertWishlistData.id
          );
        const { data: insertItemsData, error: insertItemsError } =
          await wishlistService.upsertWishlistItems(
            insertWishlistItems,
            insertWishlistData.id
          );
        console.log(insertItemsData);
        if (insertItemsError) {
          logger.error(insertItemsError);
          throw insertItemsError;
        }

        console.log(insertItemsData);

        const priceHistoryRecords: InsertPriceHistoryRecordPartialPayload[] =
          [];
        for (const item of insertItemsData) {
          priceHistoryRecords.push({
            itemId: item.id,
            itemPrice: item.marketplace_item_original_price,
            discountPercentage: 0,
          });
        }

        const {
          data: insertItemPriceHistoryRecordsData,
          error: insertItemPriceHistoryRecordsError,
        } = await priceHistoryService.insertItemPriceHistoryRecords(
          priceHistoryRecords
        );

        if (insertItemPriceHistoryRecordsError) {
          logger.error(insertItemPriceHistoryRecordsError);
          throw insertItemPriceHistoryRecordsError;
        }
        console.log(
          `inserted ${insertItemPriceHistoryRecordsData.length} items into the price_history table.`
        );

        res.status(201).json({
          ...insertWishlistData,
          size: wishlistData.wishlishItems.items.length,
          wishlist_items: insertItemsData,
        });
      } else {
        res.status(201).json({
          ...insertWishlistData,
          size: wishlistData.wishlishItems.items.length,
          wishlist_items: wishlistData.wishlishItems.items,
        });
      }
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
    //   console.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    console.log(`received request: POST /api/v1/wishlist/items`);

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

    console.log(insertItemsData);
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
    console.log(
      `received request: GET /api/v1/wishlist/${req.params.id}/items`
    );

    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   console.debug(`token user found: ${tokenUser?.id}`);
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
    console.log(`received request: PUT /api/v1/wishlist/:id`);
  }

  async handleWishlistAnalyzeItems(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.log(
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

  // TODO - Rewrite with easier query
  async handleGetWishlistCurrentDiscounts(req: Request, res: Response) {
    console.log(
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
          logger.error(itemsLatestPriceError);
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

  // TODO - Write this or maybe just get rid of it
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
    //   console.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    const userId = process.env.WISHLIST_ALERTS_MY_USER_UUID;

    console.log(
      `received request: GET /api/v1/wishlists/user/${userId}/wishlists`
    );

    const [userWishlists, userWishlistsError] =
      await wishlistService.getAllUserWishlistsWithItemsAndDiscounts(userId);

    if (userWishlistsError) {
      res.status(500).json({ error: `Unable to fetch user wishlists` });
    }

    const userWishlistsWithFilteredDiscounts = userWishlists.map((wishlist) => {
      return {
        wishlistId: wishlist.wishlist_id,
        wishlistUrl: wishlist.wishlist_url,
        wishlistTitle: wishlist.wishlist_name,
        monitored: wishlist.monitored,
        updateFrequency: wishlist.update_frequency,
        initialized: wishlist.initialized,
        createdAt: wishlist.created_at,
        lastUpdatedAt: wishlist.last_updated_at,
        wishlistItems: wishlist.wishlist_items,
        discountedItems: wishlist.wishlist_items
          .filter((item) => item.current_discount_percentage > 20)
          .sort(
            (a, b) =>
              b.current_discount_percentage - a.current_discount_percentage
          ),
      };
    });
    res.status(200).json(userWishlistsWithFilteredDiscounts);
  }

  // TODO move to a new function in the wishlistService to get all current discounts for a user
  async handleGetAllUserDiscounts(req: Request, res: Response) {
    const userId = process.env.WISHLIST_ALERTS_MY_USER_UUID;

    console.log(
      `received request: GET /api/v1/wishlists/user/${userId}/discounts`
    );
    // const token = req.headers.authorization;
    // const tokenUser = await authService.getTokenUser(token);
    // if (tokenUser) {
    //   console.debug(`token user found: ${tokenUser?.id}`);
    // } else {
    //   logger.warn(`token user not found`);
    //   res.status(401).send('Unauthorized');
    // }

    const [userWishlists, userWishlistsError] =
      await wishlistService.getAllUserWishlistsWithItemsAndDiscounts(userId);

    if (userWishlistsError !== null) {
      res.status(500).json({ error: `Unable to fetch user wishlists` });
    }

    const allUserDiscountedItems = userWishlists
      .map((wishlist) => {
        return wishlist.wishlist_items.filter(
          (item) => item.current_discount_percentage > 20
        );
      })
      .flat()
      .sort(
        (a, b) => b.current_discount_percentage - a.current_discount_percentage
      );
    return res.status(200).json(allUserDiscountedItems);
  }
}

export { WishlistController };
