import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import type { Json } from "@/integrations/supabase/types";

// CustomerPreferences type definition
export interface CustomerPreferences {
  id: string;
  user_id: string;
  dietary_restrictions: string[] | null;
  seating_preferences: string | null;
  communication_preferences: Json | null;
  favorite_cuisines: string[] | null;
  created_at: string;
  updated_at: string;
}

export const customerPreferencesApi = {
  /**
   * Fetch preferences for a customer
   */
  getPreferences: async (user_id: string): Promise<CustomerPreferences | null> => {
    try {
      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq("user_id", user_id)
        .single();
      if (error) throw error;
      return data as CustomerPreferences;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  /**
   * Update preferences for a customer
   */
  updatePreferences: async (user_id: string, updates: Partial<CustomerPreferences>): Promise<CustomerPreferences | null> => {
    try {
      const { data, error } = await supabase
        .from("customer_preferences")
        .update(updates as any)
        .eq("user_id", user_id)
        .select()
        .single();
      if (error) throw error;
      return data as CustomerPreferences;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  /**
   * Create preferences for a customer
   */
  createPreferences: async (preferences: Omit<CustomerPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerPreferences | null> => {
    try {
      const { data, error } = await supabase
        .from("customer_preferences")
        .insert([preferences as any])
        .select()
        .single();
      if (error) throw error;
      return data as CustomerPreferences;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  /**
   * Upsert preferences for a customer (create if not exists, update if exists)
   */
  upsertPreferences: async (preferences: Omit<CustomerPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerPreferences | null> => {
    try {
      const { data, error } = await supabase
        .from("customer_preferences")
        .upsert([preferences as any], { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data as CustomerPreferences;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
};
