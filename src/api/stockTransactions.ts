import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';

export interface StockTransaction {
  id: string;
  created_at: string;
  created_by: string;
  ingredient_id: string;
  quantity_change: number;
  transaction_type: string;
  notes?: string;
  stock_level_id?: string;
  unit_cost?: number;
  updated_at?: string;
  restaurant_id?: string;

  // Joined fields
  ingredients?: {
    name?: string;
  };
  profiles?: {
    first_name?: string;
    last_name?: string;
  } | null;
}

export const stockTransactionsApi = {
  async getRecent(limit = 5, restaurantId?: string): Promise<StockTransaction[]> {
    try {
      let query = supabase
        .from('stock_transactions')
        .select(`
          *,
          ingredients:ingredient_id (name),
          profiles:created_by (first_name, last_name)
        `);
      
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as StockTransaction[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  async create(transaction: Omit<StockTransaction, 'id' | 'created_at' | 'created_by'>): Promise<StockTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('stock_transactions')
        .insert([transaction])
        .select()
        .single();
      
      if (error) throw error;
      return data as StockTransaction;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }
};
