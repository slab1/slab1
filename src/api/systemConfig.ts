
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { errorTracker } from "@/utils/error-tracking";

export interface SystemConfigData {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

export interface NotificationConfigData {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

export interface SecurityConfigData {
  maxUploadSize: number;
  retentionPeriod: number;
  passwordPolicy: {
    minLength: number;
    requireSpecial: boolean;
    requireNumbers: boolean;
  };
}

export const systemConfigApi = {
  /**
   * Fetch all system settings
   */
  getSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      // Transform into a more usable format
      const settings: any = {};
      data.forEach(item => {
        settings[item.key] = item.value;
      });

      return settings;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', { context: 'get_system_settings' });
      return null;
    }
  },

  /**
   * Update a specific setting group
   */
  updateSetting: async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key, 
          value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', { 
        context: 'update_system_setting',
        key
      });
      handleApiError(error);
      return false;
    }
  }
};
