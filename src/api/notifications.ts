import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { Notification } from "./types";

export const notificationsApi = {
  /**
   * Fetch notifications for a user
   */
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Notification[];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  /**
   * Clear all notifications for a user
   */
  clearAll: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  /**
   * Create a notification
   */
  createNotification: async (notification: Omit<Notification, "id" | "created_at">): Promise<Notification | null> => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert(notification as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Notification;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  /**
   * Get notification preferences for a user
   */
  getPreferences: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  /**
   * Update notification preferences (creates if not exists)
   */
  updatePreferences: async (userId: string, preferences: any) => {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .upsert({ 
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }
};
