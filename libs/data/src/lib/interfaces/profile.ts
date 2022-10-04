export interface Profile {
  id: string;
  email: string;
  customer_id?: string;
  word_preferences: string[];
  active_subscription: boolean;
}
