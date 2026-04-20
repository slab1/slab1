import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { AvailabilityRule } from "./types";

export const availabilityRulesApi = {
  /**
   * Fetch availability rules for a restaurant
   */
  getRules: async (restaurant_id: string): Promise<AvailabilityRule[]> => {
    try {
      const { data, error } = await supabase
        .from("availability_rules")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data as unknown as AvailabilityRule[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  /**
   * Add a new availability rule
   */
  addRule: async (rule: Omit<AvailabilityRule, "id" | "created_at">): Promise<AvailabilityRule | null> => {
    try {
      const { data, error } = await supabase
        .from("availability_rules")
        .insert(rule as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AvailabilityRule;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  /**
   * Delete an availability rule
   */
  deleteRule: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("availability_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
};
