import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { getDynamicTableQuery } from "@/utils/supabase-helpers";

export interface ReservationOrderItem {
  id: string;
  reservation_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  menu_item?: {
    name: string;
    price: number;
  };
}

export const reservationOrderApi = {
  getByReservationId: async (reservationId: string): Promise<ReservationOrderItem[]> => {
    const { data, error } = await getDynamicTableQuery(
      "reservation_order_items",
      `*, menu_item:menu_item_id (name, price)`
    ).eq("reservation_id", reservationId);

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return (data || []) as ReservationOrderItem[];
  },

  addItems: async (items: Omit<ReservationOrderItem, 'id' | 'created_at' | 'updated_at'>[]) => {
    const { data, error } = await (supabase as any)
      .from("reservation_order_items")
      .insert(items)
      .select();

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return data;
  },

  removeItem: async (id: string) => {
    const { error } = await (supabase as any)
      .from("reservation_order_items")
      .delete()
      .eq("id", id);

    if (error) {
      handleApiError(error, { showToast: false });
      throw error;
    }
    return true;
  }
};
