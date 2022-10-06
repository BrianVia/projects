export interface Profile {
  id: string;
  customer_id?: string;
  word_preferences: string[];
  active_subscription: boolean;
}
