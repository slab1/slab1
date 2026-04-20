import { useNotifications } from '@/providers/NotificationProvider';

// Re-export types for compatibility
export type { RealtimeNotification, NotificationPreferences } from '@/providers/NotificationProvider';

/**
 * Hook to access real-time notifications and preferences.
 * Now a wrapper around the NotificationProvider context to ensure
 * state is shared across all components (e.g., Header and Profile).
 */
export function useRealtimeNotifications() {
  const context = useNotifications();
  
  return {
    ...context,
    // Add refreshNotifications as an alias for compatibility
    refreshNotifications: context.refreshNotifications
  };
}
