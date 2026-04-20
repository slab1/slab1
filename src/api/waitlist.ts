import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { WaitlistEntry as WaitlistEntryType } from '@/api/types';

// Export the WaitlistEntry type for use in other files
export type WaitlistEntry = WaitlistEntryType;

// DB row type (matches actual database schema)
interface WaitlistDbRow {
  id: string;
  restaurant_id: string | null;
  user_id: string | null;
  party_size: number;
  status: string;
  quoted_wait_time: number | null;
  join_time: string | null;
  seated_time: string | null;
  notes: string | null;
  phone_number: string | null;
  notification_sent: boolean | null;
  reservation_id: string | null;
  name?: string;
  special_requests?: string;
}

// Map DB row to API type
const mapFromDb = (row: WaitlistDbRow): WaitlistEntry => ({
  id: row.id,
  restaurant_id: row.restaurant_id || '',
  user_id: row.user_id || undefined,
  party_size: row.party_size,
  status: row.status as WaitlistEntry['status'],
  quoted_wait_time: row.quoted_wait_time ?? undefined,
  join_time: row.join_time ?? undefined,
  seated_time: row.seated_time ?? undefined,
  notes: row.notes ?? undefined,
  phone_number: row.phone_number ?? undefined,
  notification_sent: row.notification_sent ?? false,
  name: row.name,
  special_requests: row.special_requests,
  estimated_wait_time: row.quoted_wait_time ?? undefined,
});

// Map API type to DB insert/update
const mapToDb = (entry: Partial<WaitlistEntry>) => ({
  restaurant_id: entry.restaurant_id,
  user_id: entry.user_id,
  party_size: entry.party_size,
  status: entry.status,
  quoted_wait_time: entry.quoted_wait_time ?? entry.estimated_wait_time,
  phone_number: entry.phone_number,
  notes: entry.notes,
  name: entry.name,
  special_requests: entry.special_requests,
});

export const waitlistApi = {
  // Get all waitlist entries
  getAll: async (): Promise<WaitlistEntry[]> => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*");

      if (error) throw error;
      return (data || []).map(mapFromDb);
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Get waitlist entries for a specific restaurant
  getByRestaurantId: async (restaurantId: string): Promise<WaitlistEntry[]> => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("join_time", { ascending: true });

      if (error) throw error;
      return (data || []).map(mapFromDb);
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Get waitlist entry by ID
  getById: async (id: string): Promise<WaitlistEntry | null> => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? mapFromDb(data) : null;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Create a new waitlist entry
  create: async (entry: Partial<WaitlistEntry> & { restaurant_id: string; party_size: number; status: WaitlistEntry['status'] }): Promise<WaitlistEntry | null> => {
    try {
      const dbData = mapToDb(entry);
      const { data, error } = await supabase
        .from("waitlist")
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      return data ? mapFromDb(data) : null;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Update a waitlist entry status
  updateStatus: async (id: string, status: WaitlistEntry["status"]): Promise<WaitlistEntry | null> => {
    try {
      const updateData: Record<string, unknown> = { status };
      if (status === 'seated') {
        updateData.seated_time = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("waitlist")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapFromDb(data) : null;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Update estimated wait time
  updateWaitTime: async (id: string, quotedWaitTime: number): Promise<WaitlistEntry | null> => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .update({ quoted_wait_time: quotedWaitTime })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapFromDb(data) : null;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Mark notification as sent
  markNotificationSent: async (id: string): Promise<WaitlistEntry | null> => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .update({ notification_sent: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapFromDb(data) : null;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Delete a waitlist entry
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("waitlist")
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

export default waitlistApi;
