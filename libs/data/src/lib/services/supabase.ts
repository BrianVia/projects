import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

export const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL || `no-url-provided`,
  process.env.SUPABASE_SUPER_TOKEN || `no-token-provided`
);
