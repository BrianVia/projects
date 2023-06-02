import { Logger } from '@common/logger';
import { WishlistService } from './service';
import { PriceHistoryService } from '../../services/priceHistory';

import { Database } from '../../types/supabase';
import { AuthService } from '../../lib/auth';
import { NextFunction, Request, Response } from 'express';

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

  async handleWishlistUpdate(req: Request, res: Response, next: NextFunction) {
    logger.info(`received request: PUT /api/v1/wishlist/:id`);
  }

  async handleWishlistAnalyzeItems(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    logger.info(`received request: POST /api/v1/wishlist/:id/analyze`);
    console.log(req.params.id);
    const wishlistId = req.params.id;

    const addNewItemsFound = (req.body.addNewItemsFound as boolean) ?? true;

    const { data: wishlistData, error: wishlistError } =
      await wishlistService.fetchWishlistById(wishlistId);

    if (wishlistError) console.error(wishlistError);

    console.log(wishlistData);

    const {
      data: wishlistItemEntitesList,
      error: wishlistItemEntitiesListError,
    } = await wishlistService.getItemsByWishlistId(wishlistId);

    if (wishlistItemEntitiesListError)
      console.error(wishlistItemEntitiesListError);

    const wishlistEntities = new Map<
      string,
      Database['public']['Tables']['wishlist_items']['Row']
    >();

    wishlistItemEntitesList
      .filter((entity) => entity.marketplace_item_original_price !== undefined)
      .forEach((item) => {
        wishlistEntities.set(item.marketplace_item_href, item);
      });

    console.log(`entities size: ${wishlistEntities.size}`);

    const currentWishlistItems = await wishlistService.parseWishlist(
      wishlistData.wishlist_url
    );

    console.log(
      `current wishlist items length: ${currentWishlistItems.wishlishItems.items.length}`
    );

    const itemsNotInDB = [];

    const itemsWithPriceCuts = currentWishlistItems.wishlishItems.items
      .filter((item) => item.itemCurrentPrice !== undefined)
      .filter((item) => {
        console.log(item);
        // need to do something with items not found in the DB
        if (!wishlistEntities.has(item.itemHref)) {
          itemsNotInDB.push(item);
          return false;
        }
        return (
          item.itemCurrentPrice <
          wishlistEntities.get(item.itemHref).marketplace_item_original_price
        );
      });

    if (addNewItemsFound) {
      const newItemsToUpsert = wishlistService.generateWishlistItemEntities(
        itemsNotInDB,
        wishlistId
      );

      const { data: insertItemsData, error: insertItemsError } =
        await wishlistService.upsertWishlistItems(newItemsToUpsert, wishlistId);
    }

    console.log(`items with price cuts: ${itemsWithPriceCuts.length}`);

    const returnedData = itemsWithPriceCuts
      .map((item) => {
        return {
          ...item,
          itemOriginalPrice: wishlistEntities.get(item.itemHref)
            .marketplace_item_original_price,
          discountPercentage:
            ((wishlistEntities.get(item.itemHref)
              .marketplace_item_original_price -
              item.itemCurrentPrice) /
              wishlistEntities.get(item.itemHref)
                .marketplace_item_original_price) *
            100,
        };
      })
      .filter((item) => item.discountPercentage > 20);

    res.status(200).json({
      itemsWithPriceCuts: returnedData,
      discountThreshold: 20,
      newItemsFound: itemsNotInDB,
    });
  }
}

export { WishlistController };
