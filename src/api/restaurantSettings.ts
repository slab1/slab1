import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { RestaurantSettings } from "./types";

export const restaurantSettingsApi = {
  /**
   * Fetch settings for a restaurant
   */
  getSettings: async (restaurant_id: string): Promise<RestaurantSettings | null> => {
    try {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .single();
      if (error) throw error;
      return data as unknown as RestaurantSettings;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  /**
   * Update settings for a restaurant
   */
  updateSettings: async (restaurant_id: string, updates: Partial<RestaurantSettings>): Promise<RestaurantSettings | null> => {
    try {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .update(updates as any)
        .eq("restaurant_id", restaurant_id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as RestaurantSettings;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
};
