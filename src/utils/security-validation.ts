/**
 * Security Validation Utilities
 * 
 * IMPORTANT: These are CLIENT-SIDE checks for UI purposes only.
 * Real security is enforced by RLS policies and security definer functions on the backend.
 * Never rely on these checks for actual access control.
 */

import { supabase } from '@/integrations/supabase/client';
import { UserRole, ROLE_HIERARCHY, getRoleLevel } from '@/api/types';

/**
 * Check if user has minimum role level (UI only)
 * Backend verification happens via has_role_level() RPC
 */
export const hasMinimumRoleLevel = (userRole: UserRole, minimumRole: UserRole): boolean => {
  const userLevel = getRoleLevel(userRole);
  const minLevel = getRoleLevel(minimumRole);
  return userLevel >= minLevel;
};

/**
 * Verify user's actual role from database (uses security definer function)
 */
export const verifyUserRole = async (userId: string, expectedRole: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: expectedRole
    });
    
    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Role verification failed:', error);
    return false;
  }
};

/**
 * Verify user has minimum role level (uses security definer function)
 */
export const verifyRoleLevel = async (userId: string, minLevel: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role_level', {
      _user_id: userId,
      _min_level: minLevel
    });
    
    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Role level verification failed:', error);
    return false;
  }
};

/**
 * Verify user can access restaurant (uses security definer function)
 */
export const verifyRestaurantAccess = async (userId: string, restaurantId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_access_restaurant', {
      _user_id: userId,
      _restaurant_id: restaurantId
    });
    
    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Restaurant access verification failed:', error);
    return false;
  }
};

/**
 * Verify user can manage restaurant (uses security definer function)
 */
export const verifyRestaurantManagement = async (userId: string, restaurantId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_manage_restaurant', {
      _user_id: userId,
      _restaurant_id: restaurantId
    });
    
    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Restaurant management verification failed:', error);
    return false;
  }
};

/**
 * Security audit logger
 * Logs security-related events for monitoring
 */
export const logSecurityEvent = async (
  event: string,
  userId: string | null,
  metadata?: Record<string, any>
) => {
  try {
    // Only log in production or when explicitly enabled
    if (import.meta.env.MODE === 'development') {
      console.log('[Security Event]', { event, userId, metadata });
      return;
    }

    // In production, you could send to error_logs or a dedicated security_logs table
    await supabase.from('error_logs').insert({
      error_type: 'security_event',
      message: `Security Event: ${event}`,
      user_id: userId,
      context: metadata
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

/**
 * Validate that user session is still valid
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!session;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};

/**
 * Security check wrapper for protected actions
 * Use this to wrap sensitive operations with automatic validation
 */
export const withSecurityCheck = async <T>(
  action: () => Promise<T>,
  requiredRole?: UserRole,
  restaurantId?: string
): Promise<T> => {
  // Validate session first
  const sessionValid = await validateSession();
  if (!sessionValid) {
    throw new Error('Invalid or expired session');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check role if required
  if (requiredRole) {
    const hasRole = await verifyUserRole(user.id, requiredRole);
    if (!hasRole) {
      await logSecurityEvent('unauthorized_access_attempt', user.id, {
        requiredRole,
        restaurantId
      });
      throw new Error('Insufficient permissions');
    }
  }

  // Check restaurant access if required
  if (restaurantId) {
    const hasAccess = await verifyRestaurantAccess(user.id, restaurantId);
    if (!hasAccess) {
      await logSecurityEvent('unauthorized_restaurant_access', user.id, {
        restaurantId
      });
      throw new Error('No access to this restaurant');
    }
  }

  // Execute action
  return await action();
};
