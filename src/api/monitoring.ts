
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";

export interface SystemAuditLog {
  id: string;
  target_id: string;
  target_type: 'restaurant' | 'location' | 'menu_item' | 'user' | 'system';
  action: 'create' | 'update' | 'delete' | 'validation_fail' | 'login';
  performed_by: string;
  old_data?: any;
  new_data?: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}

export const monitoringApi = {
  /**
   * Log a system action
   */
  logAction: async (log: Omit<SystemAuditLog, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      // We try to use a generic audit log table if available, 
      // or fallback to console/analytics if not
      const { error } = await supabase
        .from("system_audit_logs" as any)
        .insert(log);
      
      if (error) {
        console.warn("Audit logging to DB failed, falling back to console:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Audit logging error:", error);
      return false;
    }
  },

  /**
   * Get edit frequency for a specific target
   */
  getEditFrequency: async (target_id: string, days: number = 30): Promise<number> => {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);
      
      const { count, error } = await supabase
        .from("system_audit_logs" as any)
        .select('*', { count: 'exact', head: true })
        .eq('target_id', target_id)
        .eq('action', 'update')
        .gte('created_at', dateLimit.toISOString());
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error fetching edit frequency:", error);
      return 0;
    }
  }
};
