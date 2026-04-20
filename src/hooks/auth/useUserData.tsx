import { useState, useCallback, useRef, useEffect } from 'react';
import { profileApi } from '@/api/profile';
import { userRoleApi } from '@/api/userRole';
import { UserType } from './types';
import { UserRole, mapDbRoleToUserRole } from '@/api/types';
import { User } from '@supabase/supabase-js';

export const useUserData = () => {
  const [user, setUser] = useState<UserType>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const isMounted = useRef(true);

  // Helper to determine if we should be loading user data based on session
  const shouldLoadData = (authUser: User | null) => {
    return !!authUser && !user;
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, [isUserDataLoading, user]);

  const setupUserData = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      console.log('useUserData: No auth user, clearing data');
      if (isMounted.current) {
        setUser(null);
        setIsUserDataLoading(false);
      }
      return;
    }

    // Prevent redundant loading if we already have the correct user
    if (user && user.id === authUser.id && !isUserDataLoading) {
      console.log('useUserData: User data already loaded for', authUser.id);
      return;
    }

    try {
      console.log('useUserData: Starting data setup for:', authUser.id);
      if (isMounted.current) {
        setIsUserDataLoading(true);
      }
      
      // Fetch user profile and role in parallel with better error handling
      const [profileData, roleData] = await Promise.allSettled([
        profileApi.getById(authUser.id),
        userRoleApi.getByUserId(authUser.id)
      ]);

      if (!isMounted.current) return;

      console.log('Profile result:', profileData);
      console.log('Role result:', roleData);

      // Extract profile data
      const profile = profileData.status === 'fulfilled' ? profileData.value : null;
      
      // Extract role data with fallback to customer
      let rawRole: string = 'customer';
      let roleSource: string = 'default';
      
      if (roleData.status === 'fulfilled' && roleData.value) {
        roleSource = 'api_success';
        if (typeof roleData.value === 'string') {
          rawRole = roleData.value;
        } else if (typeof roleData.value === 'object' && roleData.value !== null) {
          // Some APIs return the whole object, some just the role string
          const roleValue = roleData.value as { role?: string; role_id?: string };
          rawRole = roleValue.role || roleValue.role_id || 'customer';
          console.log('useUserData: Extracted role from object:', rawRole, roleData.value);
        }
      } else if (roleData.status === 'rejected') {
        roleSource = 'api_rejected';
        console.warn('useUserData: Role lookup failed, using default customer role:', roleData.reason);
      }

      // SECONDARY FALLBACK: Check profile.role if userRoleApi returned customer
      if ((rawRole === 'customer' || !rawRole) && profile?.role) {
        console.log('useUserData: Using secondary fallback role from profile:', profile.role);
        rawRole = profile.role;
        roleSource = 'profile_fallback';
      }

      // Map to standardized role
      const userRole = mapDbRoleToUserRole(rawRole);
      console.log(`useUserData: Role detection - Raw: "${rawRole}", Mapped: "${userRole}", Source: ${roleSource}`);
      console.log('Mapped role:', rawRole, '->', userRole);

      // Build user object with safe fallbacks
      const userData: UserType = {
        id: authUser.id,
        email: authUser.email || '',
        name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
              authUser.user_metadata?.full_name || 
              authUser.email || '',
        firstName: profile?.first_name || authUser.user_metadata?.first_name || authUser.user_metadata?.full_name?.split(' ')[0] || '',
        lastName: profile?.last_name || authUser.user_metadata?.last_name || authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
        role: userRole,
        phone_number: profile?.phone_number || authUser.user_metadata?.phone_number || authUser.user_metadata?.phone || '',
        address: profile?.address || authUser.user_metadata?.address || '',
        createdAt: authUser.created_at,
        is_owner: userRole === 'superadmin' || userRole === 'system_admin' || userRole === 'restaurant_owner'
      };

      console.log('Setting user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (!isMounted.current) return;

      // Fallback to basic user data to prevent auth failure
      const basicUser: UserType = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email || '',
        firstName: authUser.user_metadata?.first_name || authUser.user_metadata?.full_name?.split(' ')[0] || '',
        lastName: authUser.user_metadata?.last_name || authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        avatar_url: authUser.user_metadata?.avatar_url || '',
        role: 'customer',
        phone_number: authUser.user_metadata?.phone_number || authUser.user_metadata?.phone || '',
        address: authUser.user_metadata?.address || '',
        is_owner: false
      };
      setUser(basicUser);
    } finally {
      if (isMounted.current) {
        setIsUserDataLoading(false);
      }
    }
  }, [isUserDataLoading, user]);

  return { user, setUser, setupUserData, isUserDataLoading };
};
