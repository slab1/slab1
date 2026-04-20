import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';
import { StaffRole } from './types';

// Types for staff
export interface Staff {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
  };
}

export const staffApi = {
  async getAll(): Promise<Staff[]> {
    try {
      const { data, error } = await supabase
        .from('restaurant_staff')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            phone_number
          )
        `);
      if (error) throw error;
      return data as unknown as Staff[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },
  async getByRestaurant(restaurantId: string): Promise<Staff[]> {
    try {
      const { data, error } = await supabase
        .from('restaurant_staff')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .eq('restaurant_id', restaurantId);
      if (error) throw error;
      return data as unknown as Staff[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },
  async getById(id: string): Promise<Staff | null> {
    try {
      const { data, error } = await supabase
        .from('restaurant_staff')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as Staff;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  async create(staff: Omit<Staff, 'id' | 'created_at' | 'updated_at' | 'profiles'>): Promise<Staff | null> {
    try {
      const { data, error } = await supabase
        .from('restaurant_staff')
        .insert(staff)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Staff;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  async update(id: string, updates: Partial<Staff>): Promise<Staff | null> {
    try {
      // Remove profiles from updates as it's a joined field
      const { profiles, ...updateData } = updates;
      const { data, error } = await supabase
        .from('restaurant_staff')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Staff;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('restaurant_staff').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
};
export type { StaffRole };

