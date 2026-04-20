import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { MenuItem, MenuItemIngredient } from "./types";

export const menuItemApi = {
  getByRestaurantId: async (restaurantId: string): Promise<MenuItem[]> => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId);

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return data || [];
  },

  create: async (menuItem: { name: string; restaurant_id: string; price: number; description?: string; category_id?: string; is_available?: boolean; image_url?: string; allergens?: string[]; dietary_tags?: string[]; preparation_time?: number; sort_order?: number; currency_code?: string }): Promise<MenuItem | null> => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert([menuItem])
      .select()
      .single();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return data;
  },

  update: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
    const { data, error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return data;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return true;
  },

  getAll: async (): Promise<MenuItem[]> => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*");

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return data || [];
  },

  getIngredients: async (menuItemId: string): Promise<MenuItemIngredient[]> => {
    const { data, error } = await supabase
      .from("menu_item_ingredients")
      .select(`
        *,
        ingredient:ingredients(
          *,
          stock_levels(current_quantity)
        )
      `)
      .eq("menu_item_id", menuItemId);

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    // Map the data to include stock quantity for convenience
    return (data || []).map((item: any) => ({
      ...item,
      current_stock: item.ingredient?.stock_levels?.[0]?.current_quantity || 0
    })) as MenuItemIngredient[];
  },

  updateIngredients: async (menuItemId: string, ingredients: { ingredient_id: string, quantity_required: number, unit: string }[]) => {
    // Delete existing ingredients
    const { error: deleteError } = await supabase
      .from("menu_item_ingredients")
      .delete()
      .eq("menu_item_id", menuItemId);

    if (deleteError) {
      handleApiError(deleteError, { showToast: false });
      throw deleteError;
    }

    // Insert new ingredients
    if (ingredients.length > 0) {
      const { error: insertError } = await supabase
        .from("menu_item_ingredients")
        .insert(
          ingredients.map(ing => ({
            menu_item_id: menuItemId,
            ingredient_id: ing.ingredient_id,
            quantity_required: ing.quantity_required,
            unit: ing.unit
          }))
        );

      if (insertError) {
        handleApiError(insertError, { showToast: false });
        throw insertError;
      }
    }

    return true;
  }
};
