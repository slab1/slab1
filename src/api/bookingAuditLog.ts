import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { BookingAuditLog } from "./types";

export const bookingAuditLogApi = {
  /**
   * Fetch audit logs for a booking
   */
  getLogsForBooking: async (booking_id: string): Promise<BookingAuditLog[]> => {
    try {
      const { data, error } = await supabase
        .from("booking_audit_log")
        .select("*")
        .eq("booking_id", booking_id)
        .order("changed_at", { ascending: false });
      if (error) throw error;
      return data as unknown as BookingAuditLog[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  /**
   * Add a new audit log entry
   */
  addLog: async (log: Omit<BookingAuditLog, "id" | "changed_at">): Promise<BookingAuditLog | null> => {
    try {
      const { data, error } = await supabase
        .from("booking_audit_log")
        .insert(log as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as BookingAuditLog;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
};
