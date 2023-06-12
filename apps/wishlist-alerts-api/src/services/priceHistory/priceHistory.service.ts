import { PostgrestError, createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

const supabaseClient = createClient<Database>(
  process.env.WISHLIST_ALERTS_SUPABASE_URL,
  process.env.WISHLIST_ALERTS_SUPABASE_SUPER_TOKEN
);

class PriceHistoryService {
  public async insertItemPriceHistoryRecord(
    itemId: string,
    itemPrice: number,
    discountPercentage?: number
  ): Promise<{
    data: Database['public']['Tables']['price_history']['Insert'];
    error: PostgrestError;
  }> {
    const { data, error } = await supabaseClient.from('price_history').insert([
      {
        item_id: itemId,
        price: itemPrice,
        discount_percentage: discountPercentage,
      },
    ]);
    return Promise.resolve({ data, error });
  }

  public async insertItemPriceHistoryRecords(
    items: {
      itemId: string;
      itemPrice: number;
      discountPercentage?: number;
    }[]
  ): Promise<{
    data: Database['public']['Tables']['price_history']['Insert'][];
    error: PostgrestError;
  }> {
    // console.log('inserting items into price history table');

    const insertRecordsPayload = items
      .filter(
        (item) =>
          item.itemPrice != undefined &&
          item.itemPrice != null &&
          !Number.isNaN(item.itemPrice)
      )
      .map((item) => {
        // console.log(item);
        return {
          item_id: item.itemId,
          price: item.itemPrice,
          discount_percentage: item.discountPercentage ?? 0,
        };
      });

    // console.log(insertRecordsPayload.filter((item) => item.price === null));

    const { data, error } = await supabaseClient
      .from('price_history')
      .insert(insertRecordsPayload)
      .select('*');

    // console.debug(data);
    // console.debug(error);
    if (error) console.error(error.toString());
    return Promise.resolve({ data, error });
  }

  public async getItemLatestPrice(
    itemId: string
  ): Promise<
    [Database['public']['Tables']['price_history']['Row'], PostgrestError]
  > {
    const { data, error } = await supabaseClient
      .from('price_history')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log(itemId);
    console.log(data);
    console.log(error);

    return Promise.resolve([data, error]);
  }

  public async getItemsLatestPrices(
    itemIds: string[]
  ): Promise<
    [Database['public']['Tables']['price_history']['Row'][], PostgrestError]
  > {
    const { data, error } = await supabaseClient
      .from('price_history')
      .select('*')
      .in('item_id', itemIds)
      .order('created_at', { ascending: false });
    console.log(data);
    console.log(error);

    return Promise.resolve([data, error]);
  }
}
export { PriceHistoryService };
