import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { Database } from '../../types/supabase';

export const supabase: SupabaseClient<Database> = createClient(
  process.env.WISHLIST_ALERTS_SUPABASE_URL || `no-url-provided`,
  process.env.WISHLIST_ALERTS_SUPABASE_SUPER_TOKEN || `no-token-provided`
);
