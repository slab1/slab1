import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { LoyaltyProgram } from "./types";

export const loyaltyProgramsApi = {
  /**
   * Fetch loyalty programs for a restaurant
   */
  getPrograms: async (restaurant_id: string): Promise<LoyaltyProgram[]> => {
    try {
      const { data, error } = await supabase
        .from("loyalty_programs")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as LoyaltyProgram[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  /**
   * Add a new loyalty program
   */
  addProgram: async (program: Omit<LoyaltyProgram, "id" | "created_at" | "updated_at">): Promise<LoyaltyProgram | null> => {
    try {
      const { data, error } = await supabase
        .from("loyalty_programs")
        .insert(program as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as LoyaltyProgram;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  /**
   * Update a loyalty program
   */
  updateProgram: async (id: string, updates: Partial<LoyaltyProgram>): Promise<LoyaltyProgram | null> => {
    try {
      const { data, error } = await supabase
        .from("loyalty_programs")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as LoyaltyProgram;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
};
