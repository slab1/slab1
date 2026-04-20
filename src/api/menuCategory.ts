import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { MenuCategory } from "./types";

export const menuCategoryApi = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*, items:menu_items!fk_menu_items_category(*)");
      
      if (error) throw error;
      
      return data as MenuCategory[];
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*, items:menu_items!fk_menu_items_category(*)")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      return data as MenuCategory;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  create: async (category: { name: string; restaurant_id: string; description?: string; is_active?: boolean; sort_order?: number }) => {
    try {
      const { data, error } = await supabase
        .from("menu_categories")
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as MenuCategory;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  update: async (id: string, updates: Partial<MenuCategory>) => {
    try {
      const { data, error } = await supabase
        .from("menu_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as MenuCategory;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from("menu_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
