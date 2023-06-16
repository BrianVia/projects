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
      notifications_sent: {
        Row: {
          id: string
          items_included: string[] | null
          notification_content: Json | null
          notification_medium: string
          recipient_id: string
          time_sent: string | null
        }
        Insert: {
          id: string
          items_included?: string[] | null
          notification_content?: Json | null
          notification_medium: string
          recipient_id: string
          time_sent?: string | null
        }
        Update: {
          id?: string
          items_included?: string[] | null
          notification_content?: Json | null
          notification_medium?: string
          recipient_id?: string
          time_sent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sent_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      price_history: {
        Row: {
          created_at: string | null
          discount_percentage: number | null
          id: string
          item_id: string | null
          price: number
        }
        Insert: {
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          item_id?: string | null
          price: number
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          item_id?: string | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "wishlist_items"
            referencedColumns: ["id"]
          }
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          last_updated_at: string | null
          marketplace_item_href: string
          marketplace_item_id: string
          marketplace_item_image_url: string | null
          marketplace_item_maker: string
          marketplace_item_original_price: number | null
          marketplace_item_title: string
          monitored: boolean
          referral_link: string | null
          update_frequency: string | null
          wishlist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated_at?: string | null
          marketplace_item_href: string
          marketplace_item_id: string
          marketplace_item_image_url?: string | null
          marketplace_item_maker: string
          marketplace_item_original_price?: number | null
          marketplace_item_title: string
          monitored?: boolean
          referral_link?: string | null
          update_frequency?: string | null
          wishlist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated_at?: string | null
          marketplace_item_href?: string
          marketplace_item_id?: string
          marketplace_item_image_url?: string | null
          marketplace_item_maker?: string
          marketplace_item_original_price?: number | null
          marketplace_item_title?: string
          monitored?: boolean
          referral_link?: string | null
          update_frequency?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          initialized: boolean
          last_updated_at: string | null
          monitored: boolean
          name: string | null
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
          name?: string | null
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
          name?: string | null
          update_frequency?: string | null
          wishlist_url?: string | null
          wishlist_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_wishlist_user_id_fkey"
            columns: ["wishlist_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
