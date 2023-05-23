export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          created_at: string | null
          default_update_frequency: string | null
          id: string
          notification_preferences: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          default_update_frequency?: string | null
          id?: string
          notification_preferences?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          default_update_frequency?: string | null
          id?: string
          notification_preferences?: Json | null
          user_id?: string | null
        }
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          last_updated_at: string | null
          marketplace_item_current_price: number
          marketplace_item_href: string
          marketplace_item_id: string
          marketplace_item_image_url: string | null
          marketplace_item_maker: string
          marketplace_item_original_price: number
          marketplace_item_title: string
          monitored: boolean
          referral_link: string | null
          update_frequency: string | null
          wishlistId: string
        }
        Insert: {
          created_at?: string | null
          id: string
          last_updated_at?: string | null
          marketplace_item_current_price: number
          marketplace_item_href: string
          marketplace_item_id: string
          marketplace_item_image_url?: string | null
          marketplace_item_maker: string
          marketplace_item_original_price: number
          marketplace_item_title: string
          monitored?: boolean
          referral_link?: string | null
          update_frequency?: string | null
          wishlistId: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated_at?: string | null
          marketplace_item_current_price?: number
          marketplace_item_href?: string
          marketplace_item_id?: string
          marketplace_item_image_url?: string | null
          marketplace_item_maker?: string
          marketplace_item_original_price?: number
          marketplace_item_title?: string
          monitored?: boolean
          referral_link?: string | null
          update_frequency?: string | null
          wishlistId?: string
        }
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          initialized: boolean
          last_updated_at: string | null
          monitored: boolean
          update_frequency: string | null
          wishlist_url: string | null
          wishlist_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          initialized?: boolean
          last_updated_at?: string | null
          monitored?: boolean
          update_frequency?: string | null
          wishlist_url?: string | null
          wishlist_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          initialized?: boolean
          last_updated_at?: string | null
          monitored?: boolean
          update_frequency?: string | null
          wishlist_url?: string | null
          wishlist_user_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}