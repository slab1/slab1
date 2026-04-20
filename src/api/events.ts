import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';

// Event type definition
export interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const eventsApi = {
  async getAll(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');
      if (error) throw error;
      return (data || []) as Event[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  async getById(id: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Event;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();
      if (error) throw error;
      return data as Event;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Event>): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Event;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
};
