import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { SpecialEvent } from "./types";
import { loyaltyApi } from "./loyalty";

export const specialEventApi = {
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase.from("special_events")
      .select(`
        *,
        restaurant:restaurants!fk_special_events_restaurant (
          id,
          name,
          image_url
        ),
        location:restaurant_locations!special_events_location_id_fkey (
          id,
          location_name,
          address,
          city,
          state
        )
      `)
      .eq("user_id", userId)
      .order("event_date", { ascending: false });

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return (data || []) as unknown as SpecialEvent[];
  },

  getByRestaurantId: async (restaurantId: string) => {
    const { data, error } = await supabase.from("special_events")
      .select(`
        *,
        restaurant:restaurants!fk_special_events_restaurant (
          id,
          name,
          image_url
        ),
        location:restaurant_locations!special_events_location_id_fkey (
          id,
          location_name,
          address,
          city,
          state
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order("event_date", { ascending: true });

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return (data || []) as unknown as SpecialEvent[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase.from("special_events")
      .select(`
        *,
        restaurant:restaurants!fk_special_events_restaurant (
          id,
          name,
          image_url
        ),
        location:restaurant_locations!special_events_location_id_fkey (
          id,
          location_name,
          address,
          city,
          state
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return data as unknown as SpecialEvent;
  },

  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase.from("special_events")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    // Award loyalty points if status is updated to completed
    if (status === 'completed' && data && (data as any).user_id) {
      await loyaltyApi.addPoints((data as any).user_id, 50, "Completed special event");
    }
    
    return data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const { data, error } = await supabase.from("special_events")
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return data;
  },

  updateDetails: async (id: string, details: { quote_estimate?: number, deposit_amount?: number, internal_notes?: string }) => {
    const { data, error } = await supabase.from("special_events")
      .update({ ...details, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return data;
  },

  getOrderItems: async (eventId: string) => {
    const { data, error } = await supabase.from("special_event_order_items")
      .select(`
        *,
        menu_item:menu_items (
          name,
          price
        )
      `)
      .eq("special_event_id", eventId);

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return data;
  },

  addOrderItems: async (items: any[]) => {
    const { data, error } = await supabase.from("special_event_order_items")
      .insert(items)
      .select();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return data;
  },

  removeOrderItem: async (id: string) => {
    const { error } = await supabase.from("special_event_order_items")
      .delete()
      .eq("id", id);

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return true;
  },

  create: async (event: Omit<SpecialEvent, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("special_events")
      .insert(event)
      .select()
      .single();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    
    return data;
  }
};
