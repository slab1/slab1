import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { notificationsApi } from '@/api/notifications';
import { Notification as DbNotification, RealtimeNotificationType } from '@/api/types';

export interface RealtimeNotification {
  id: string;
  type: RealtimeNotificationType;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  booking_confirmations: boolean;
  reservation_reminders: boolean;
  special_offers: boolean;
  system_notifications: boolean;
  marketing_emails: boolean;
}

interface NotificationContextType {
  notifications: RealtimeNotification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  addNotification: (notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>, persist?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  requestNotificationPermission: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  updatePreferences: (newPrefs: Partial<NotificationPreferences>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// PWA Push Notification Setup Helper
const setupPushNotifications = async (userId: string) => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const subscription = await (registration as any).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            import.meta.env.VITE_VAPID_PUBLIC_KEY ||
            'BKxQzAQrI9C8W7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K'
          )
        });

        await supabase.from('push_subscriptions').upsert({
          user_id: userId,
          subscription: JSON.stringify(subscription),
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });

        return subscription;
      }
    } catch (error) {
      console.error('Push notification setup failed:', error);
    }
  }
  return null;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const isInitialFetchDone = useRef(false);

  const mapDbToRealtime = useCallback((n: DbNotification): RealtimeNotification => ({
    id: n.id,
    type: n.type as RealtimeNotificationType,
    title: n.title,
    message: n.message,
    data: n.data,
    timestamp: new Date(n.created_at),
    read: n.read
  }), []);

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    
    const [dbNotifications, dbPreferences] = await Promise.all([
      notificationsApi.getUserNotifications(user.id),
      notificationsApi.getPreferences(user.id)
    ]);

    const mapped = dbNotifications.map(mapDbToRealtime);
    
    setNotifications(mapped);
    setUnreadCount(mapped.filter(n => !n.read).length);
    setPreferences(dbPreferences as any);
    isInitialFetchDone.current = true;
  }, [user, mapDbToRealtime]);

  const addNotification = useCallback(async (notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>, persist = true) => {
    if (!user) return;

    const isPushAllowed = preferences?.push_enabled !== false;
    const isTypeAllowed = (() => {
      if (!preferences) return true;
      switch (notification.type) {
        case 'reservation_confirmed':
        case 'reservation_cancelled':
        case 'new_booking':
          return preferences.booking_confirmations;
        case 'reservation_reminder':
        case 'shift_reminder':
          return preferences.reservation_reminders;
        case 'staff_assigned':
        case 'schedule_update':
        case 'staff_invitation':
          return preferences.system_notifications;
        case 'special_offer':
          return preferences.special_offers;
        case 'system_announcement':
          return preferences.system_notifications;
        default:
          return true;
      }
    })();

    if (!isTypeAllowed) return;

    let id = Date.now().toString();
    let timestamp = new Date();

    if (persist) {
      const dbResult = await notificationsApi.createNotification({
        user_id: user.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: false
      });
      
      if (dbResult) {
        id = dbResult.id;
        timestamp = new Date(dbResult.created_at);
      }
    }

    const newNotification: RealtimeNotification = {
      ...notification,
      id,
      timestamp,
      read: false
    };

    setNotifications(prev => {
      if (prev.some(n => n.id === id)) return prev;
      setUnreadCount(count => count + 1);
      return [newNotification, ...prev.slice(0, 49)];
    });

    if (isPushAllowed) {
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000
      });

      if (Notification.permission === 'granted' && document.hidden) {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
    }
  }, [user, preferences]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
        return prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
      }
      return prev;
    });
    await notificationsApi.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    await notificationsApi.markAllAsRead(user.id);
  }, [user]);

  const clearAll = useCallback(async () => {
    if (!user) return;
    setNotifications([]);
    setUnreadCount(0);
    await notificationsApi.clearAll(user.id);
  }, [user]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user) return;
    const updated = await notificationsApi.updatePreferences(user.id, newPrefs);
    if (updated) setPreferences(updated as any);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
      isInitialFetchDone.current = false;
      return;
    }

    if (!isInitialFetchDone.current) {
      fetchInitialData();
      setupPushNotifications(user.id);
    }

    requestNotificationPermission();

    const notificationsChannel = supabase
      .channel(`user_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newDbNotif = payload.new as DbNotification;
          const mapped = mapDbToRealtime(newDbNotif);
          
          setNotifications(prev => {
            if (prev.some(n => n.id === mapped.id)) return prev;
            if (!mapped.read) {
              setUnreadCount(count => count + 1);
            }
            return [mapped, ...prev.slice(0, 49)];
          });
          
          if (preferences?.push_enabled !== false) {
            toast.info(mapped.title, {
              description: mapped.message,
              duration: 5000
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, fetchInitialData, mapDbToRealtime, preferences, requestNotificationPermission]);

  // Handle other listeners (reservations, waitlist, etc.) in a separate effect
  useEffect(() => {
    if (!user) return;

    const reservationChannel = supabase
      .channel(`reservation_updates_${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservations', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          const { new: newRecord, old: oldRecord } = payload;
          if (newRecord.status !== oldRecord.status) {
            if (newRecord.status === 'confirmed') {
              addNotification({
                type: 'reservation_confirmed',
                title: 'Reservation Confirmed!',
                message: `Your reservation for ${new Date(newRecord.reservation_date).toLocaleDateString()} has been confirmed.`,
                data: newRecord
              });
            } else if (newRecord.status === 'cancelled') {
              addNotification({
                type: 'reservation_cancelled',
                title: 'Reservation Cancelled',
                message: `Your reservation for ${new Date(newRecord.reservation_date).toLocaleDateString()} has been cancelled.`,
                data: newRecord
              });
            }
          }
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(reservationChannel);
    };
  }, [user, addNotification]);

  const value = {
    notifications,
    unreadCount,
    preferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestNotificationPermission,
    refreshNotifications: fetchInitialData,
    updatePreferences
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
