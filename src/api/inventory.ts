import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';
import { getDynamicTableQuery } from '@/utils/supabase-helpers';

// Types for inventory
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  max_stock?: number;
  unit_cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  location_id?: string;
  restaurant_id?: string;
}

// Type for ingredient with stock_levels from query
interface IngredientWithStock {
  id: string;
  name: string;
  category?: string | null;
  unit: string;
  unit_size?: number | null;
  reorder_threshold?: number | null;
  is_active?: boolean | null;
  restaurant_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  stock_levels?: Array<{
    current_quantity: number;
    location_id?: string | null;
    unit_cost?: number | null;
  }> | null;
}

function mapIngredientToInventoryItem(item: IngredientWithStock): InventoryItem {
  const stock = item.stock_levels?.[0] || { current_quantity: 0, unit_cost: 0 };
  return {
    id: item.id,
    name: item.name,
    category: item.category || 'Uncategorized',
    quantity: stock.current_quantity || 0,
    unit: item.unit,
    min_stock: item.reorder_threshold || 0,
    max_stock: 0,
    unit_cost: stock.unit_cost || 0,
    is_active: item.is_active !== false,
    created_at: item.created_at || '',
    updated_at: item.updated_at || '',
    location_id: stock.location_id || undefined,
    restaurant_id: item.restaurant_id || undefined
  };
}

export const inventoryApi = {
  async getAll(restaurantId?: string): Promise<InventoryItem[]> {
    let query = supabase
      .from('ingredients')
      .select(`
        id, name, category, unit, unit_size, reorder_threshold, is_active, restaurant_id, created_at, updated_at,
        stock_levels (
          current_quantity,
          location_id,
          unit_cost
        )
      `);
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }

    return (data || []).map((item: any) => mapIngredientToInventoryItem(item));
  },

  async getById(id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('ingredients')
      .select(`
        id, name, category, unit, unit_size, reorder_threshold, is_active, restaurant_id, created_at, updated_at,
        stock_levels (
          current_quantity,
          location_id,
          unit_cost
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }

    return mapIngredientToInventoryItem(data as any);
  },

  async updateStock(id: string, newQuantity: number, locationId?: string): Promise<boolean> {
    const { error } = await supabase
      .from('stock_levels')
      .upsert({
        ingredient_id: id,
        current_quantity: newQuantity,
        location_id: locationId,
        last_updated: new Date().toISOString()
      }, { onConflict: 'ingredient_id,location_id' });
    
    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return true;
  },

  async create(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem | null> {
    try {
      if (!item.restaurant_id) {
        throw new Error('restaurant_id is required for creating an ingredient');
      }

      const { data: ingredient, error: ingError } = await supabase
        .from('ingredients')
        .insert([{
          name: item.name,
          category: item.category,
          unit: item.unit,
          reorder_threshold: item.min_stock,
          is_active: item.is_active,
          restaurant_id: item.restaurant_id
        }])
        .select()
        .single();

      if (ingError) throw ingError;

      const { data: stock, error: stockError } = await supabase
        .from('stock_levels')
        .insert([{
          ingredient_id: ingredient.id,
          current_quantity: item.quantity,
          unit_cost: item.unit_cost || 0,
          location_id: item.location_id || null,
          restaurant_id: item.restaurant_id
        }])
        .select()
        .single();

      if (stockError) throw stockError;

      return {
        ...item,
        id: ingredient.id,
        created_at: ingredient.created_at || '',
        updated_at: ingredient.updated_at || '',
        quantity: stock.current_quantity,
        unit_cost: stock.unit_cost,
        location_id: stock.location_id,
        restaurant_id: ingredient.restaurant_id
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    try {
      const ingredientUpdates: Record<string, unknown> = {};
      if (updates.name) ingredientUpdates.name = updates.name;
      if (updates.category) ingredientUpdates.category = updates.category;
      if (updates.unit) ingredientUpdates.unit = updates.unit;
      if (updates.min_stock !== undefined) ingredientUpdates.reorder_threshold = updates.min_stock;
      if (updates.is_active !== undefined) ingredientUpdates.is_active = updates.is_active;
      if (updates.restaurant_id) ingredientUpdates.restaurant_id = updates.restaurant_id;

      if (Object.keys(ingredientUpdates).length > 0) {
        const { error: ingError } = await supabase
          .from('ingredients')
          .update(ingredientUpdates)
          .eq('id', id);
        if (ingError) throw ingError;
      }

      const stockUpdates: Record<string, unknown> = {};
      if (updates.quantity !== undefined) stockUpdates.current_quantity = updates.quantity;
      if (updates.unit_cost !== undefined) stockUpdates.unit_cost = updates.unit_cost;
      if (updates.location_id !== undefined) stockUpdates.location_id = updates.location_id;
      if (updates.restaurant_id) stockUpdates.restaurant_id = updates.restaurant_id;

      if (Object.keys(stockUpdates).length > 0) {
        const { error: stockError } = await supabase
          .from('stock_levels')
          .update(stockUpdates)
          .eq('ingredient_id', id);
        if (stockError) throw stockError;
      }

      return await this.getById(id);
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('ingredients').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  async depleteFromReservation(reservationId: string): Promise<boolean> {
    try {
      // Use dynamic table query for non-standard tables
      const { data: orderItems, error: orderError } = await getDynamicTableQuery(
        'reservation_order_items',
        `menu_item_id, quantity, menu_item:menu_items (name, menu_item_ingredients (ingredient_id, quantity_required))`
      ).eq('reservation_id', reservationId);

      if (orderError) throw orderError;
      if (!orderItems || orderItems.length === 0) return true;

      const ingredientConsumption: Record<string, number> = {};
      
      orderItems.forEach((item: any) => {
        const ingredients = item.menu_item?.menu_item_ingredients || [];
        ingredients.forEach((ing: any) => {
          const totalNeeded = ing.quantity_required * item.quantity;
          ingredientConsumption[ing.ingredient_id] = (ingredientConsumption[ing.ingredient_id] || 0) + totalNeeded;
        });
      });

      for (const [ingredientId, amount] of Object.entries(ingredientConsumption)) {
        const { data: currentStock, error: stockFetchError } = await supabase
          .from('stock_levels')
          .select('current_quantity, restaurant_id')
          .eq('ingredient_id', ingredientId)
          .single();

        if (stockFetchError) continue;

        const newQuantity = Math.max(0, (currentStock.current_quantity || 0) - amount);

        const { error: updateError } = await supabase
          .from('stock_levels')
          .update({ current_quantity: newQuantity })
          .eq('ingredient_id', ingredientId);

        if (!updateError) {
          await supabase.from('stock_transactions').insert([{
            ingredient_id: ingredientId,
            restaurant_id: currentStock.restaurant_id,
            transaction_type: 'usage',
            quantity_change: -amount,
            notes: `Auto-depleted from reservation ${reservationId}`
          }]);
        }
      }

      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  async depleteFromSpecialEvent(eventId: string): Promise<boolean> {
    try {
      const { data: orderItems, error: orderError } = await getDynamicTableQuery(
        'special_event_order_items',
        `menu_item_id, quantity, menu_item:menu_items (name, menu_item_ingredients (ingredient_id, quantity_required))`
      ).eq('special_event_id', eventId);

      if (orderError) throw orderError;
      if (!orderItems || orderItems.length === 0) return true;

      const ingredientConsumption: Record<string, number> = {};
      
      orderItems.forEach((item: any) => {
        const ingredients = item.menu_item?.menu_item_ingredients || [];
        ingredients.forEach((ing: any) => {
          const totalNeeded = ing.quantity_required * item.quantity;
          ingredientConsumption[ing.ingredient_id] = (ingredientConsumption[ing.ingredient_id] || 0) + totalNeeded;
        });
      });

      for (const [ingredientId, amount] of Object.entries(ingredientConsumption)) {
        const { data: currentStock, error: stockFetchError } = await supabase
          .from('stock_levels')
          .select('current_quantity, restaurant_id')
          .eq('ingredient_id', ingredientId)
          .single();

        if (stockFetchError) continue;

        const newQuantity = Math.max(0, (currentStock.current_quantity || 0) - amount);

        const { error: updateError } = await supabase
          .from('stock_levels')
          .update({ current_quantity: newQuantity })
          .eq('ingredient_id', ingredientId);

        if (!updateError) {
          await supabase.from('stock_transactions').insert([{
            ingredient_id: ingredientId,
            restaurant_id: currentStock.restaurant_id,
            transaction_type: 'usage',
            quantity_change: -amount,
            notes: `Auto-depleted from special event ${eventId}`
          }]);
        }
      }

      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
};
