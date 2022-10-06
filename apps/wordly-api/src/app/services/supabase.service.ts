import { SupabaseClient } from '@supabase/supabase-js';
export class SupabaseService {
  client = SupabaseClient;
  constructor() {
    this.client;
  }

  getClient() {
    return;
  }
}
