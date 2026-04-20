import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  max_locations: number | null;
  max_staff: number | null;
  analytics_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const subscriptionApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      // Transform features from Json to string[]
      return (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? (plan.features as string[]) : []
      })) as SubscriptionPlan[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  async getPlanById(id: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        features: Array.isArray(data.features) ? (data.features as string[]) : []
      } as SubscriptionPlan;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async createPlan(plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return data as SubscriptionPlan;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SubscriptionPlan;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async deletePlan(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  }
};
