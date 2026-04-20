/**
 * Custom type augmentations for Supabase
 * 
 * This file extends the auto-generated types with:
 * 1. Missing tables (events, customer_preferences)
 * 2. Missing columns on existing tables
 * 3. RPC function signatures
 * 4. Helper types for API usage
 */

import type { Database as OriginalDatabase, Json, Tables, TablesInsert, TablesUpdate } from './types';

// ============================================
// Missing Table Definitions
// ============================================

export interface EventsTableRow {
  id: string;
  name: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventsTableInsert {
  id?: string;
  name: string;
  description?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventsTableUpdate {
  id?: string;
  name?: string;
  description?: string | null;
  date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  capacity?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerPreferencesRow {
  id: string;
  user_id: string;
  dietary_restrictions: string[] | null;
  seating_preferences: string | null;
  communication_preferences: Json | null;
  favorite_cuisines: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerPreferencesInsert {
  id?: string;
  user_id: string;
  dietary_restrictions?: string[] | null;
  seating_preferences?: string | null;
  communication_preferences?: Json | null;
  favorite_cuisines?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerPreferencesUpdate {
  id?: string;
  user_id?: string;
  dietary_restrictions?: string[] | null;
  seating_preferences?: string | null;
  communication_preferences?: Json | null;
  favorite_cuisines?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// Waitlist Table Types
// ============================================

export interface WaitlistRow {
  id: string;
  restaurant_id: string | null;
  user_id: string | null;
  party_size: number;
  status: string;
  quoted_wait_time: number | null;
  join_time: string | null;
  seated_time: string | null;
  notes: string | null;
  phone_number: string | null;
  notification_sent: boolean | null;
  reservation_id: string | null;
}

export interface WaitlistInsert {
  id?: string;
  restaurant_id?: string | null;
  user_id?: string | null;
  party_size: number;
  status?: string;
  quoted_wait_time?: number | null;
  join_time?: string | null;
  seated_time?: string | null;
  notes?: string | null;
  phone_number?: string | null;
  notification_sent?: boolean | null;
  reservation_id?: string | null;
}

export interface WaitlistUpdate {
  id?: string;
  restaurant_id?: string | null;
  user_id?: string | null;
  party_size?: number;
  status?: string;
  quoted_wait_time?: number | null;
  join_time?: string | null;
  seated_time?: string | null;
  notes?: string | null;
  phone_number?: string | null;
  notification_sent?: boolean | null;
  reservation_id?: string | null;
}

// API-friendly waitlist type
export interface WaitlistEntryApi {
  id: string;
  restaurant_id: string;
  user_id?: string;
  party_size: number;
  status: 'waiting' | 'seated' | 'cancelled' | 'no_show';
  quoted_wait_time?: number;
  estimated_wait_time?: number; // Alias for quoted_wait_time
  join_time?: string;
  seated_time?: string;
  notes?: string;
  phone_number?: string;
  notification_sent?: boolean;
  name?: string; // Derived from notes
  special_requests?: string; // Derived from notes
}

// ============================================
// Extended RPC Function Definitions
// ============================================

export interface ExtendedFunctions {
  exec_sql: {
    Args: { sql_query: string };
    Returns: Json[];
  };
  redeem_loyalty_reward: {
    Args: { p_user_id: string; p_reward_id: string };
    Returns: { success: boolean; message: string; new_points_balance?: number };
  };
}

// ============================================
// Extended Database Type
// ============================================

export interface ExtendedDatabase extends OriginalDatabase {
  public: OriginalDatabase['public'] & {
    Tables: OriginalDatabase['public']['Tables'] & {
      events: {
        Row: EventsTableRow;
        Insert: EventsTableInsert;
        Update: EventsTableUpdate;
        Relationships: [];
      };
      customer_preferences: {
        Row: CustomerPreferencesRow;
        Insert: CustomerPreferencesInsert;
        Update: CustomerPreferencesUpdate;
        Relationships: [];
      };
    };
    Functions: OriginalDatabase['public']['Functions'] & ExtendedFunctions;
  };
}

// ============================================
// API-Friendly Type Aliases
// ============================================

// Loyalty types
export interface LoyaltyPointsApi {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransactionApi {
  id: string;
  user_id: string;
  points: number;
  description: string | null;
  transaction_type: string;
  restaurant_id: string | null;
  program_id: string | null;
  created_at: string;
}

export interface LoyaltyRedemptionApi {
  id: string;
  user_id: string;
  reward_id: string | null;
  points_used: number;
  created_at: string;
  reward?: LoyaltyRewardApi;
}

export interface LoyaltyRewardApi {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Extended Ingredient type with missing columns
export interface ExtendedIngredient {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  unit_size: number | null;
  reorder_threshold: number | null;
  is_active: boolean | null;
  restaurant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Not in DB but computed from stock_levels
  max_stock?: number;
}

// Stock level with location
export interface StockLevelWithLocation {
  current_quantity: number;
  location_id: string | null;
  unit_cost: number;
  restaurant_id?: string | null;
}

// Re-export original types for convenience
export type { Json, Tables, TablesInsert, TablesUpdate };
