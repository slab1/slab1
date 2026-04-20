
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../utils";
import { UserRole, ApiErrorResponse, ROLE_HIERARCHY, getRoleLevel, mapDbRoleToUserRole } from "../types";
import { UserWithRoleProfile } from "./types";

export const getUserRoleById = async (userId: string): Promise<UserRole | ApiErrorResponse> => {
  try {
    // Use security definer function to get highest role
    const { data, error } = await supabase.rpc("get_user_highest_role", {
      _user_id: userId
    });

    if (error) throw error;
    
    // Fallback to direct query if RPC fails
    if (!data) {
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role, role_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleError) throw roleError;
      // Map database role to UserRole type
      return mapDbRoleToUserRole(roleData?.role || roleData?.role_id);
    }

    // Map the returned role to UserRole type
    return mapDbRoleToUserRole(data);
  } catch (error) {
    return handleApiError(error, { 
      context: 'get_user_role_by_id',
      additionalInfo: { userId }
    });
  }
};

export const getAllUserRoles = async (): Promise<UserWithRoleProfile[] | ApiErrorResponse> => {
  try {
    // Get profiles data first - this is our primary list of users
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, created_at, is_active, last_login");

    if (profilesError) {
      throw profilesError;
    }

    // Get user roles data
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesError) {
      throw rolesError;
    }

    if (!profilesData) {
      return [];
    }

    // Create a map for quick role lookup
    const roleMap = new Map();
    rolesData?.forEach(role => {
      roleMap.set(role.user_id, role);
    });

    // Manually join the data starting from profiles to ensure all users are included
    const transformedData: UserWithRoleProfile[] = profilesData.map((profile) => {
      const role = roleMap.get(profile.id);
      
      // Map database role to UserRole type, default to 'customer' if no role record exists
      const userRole = role ? mapDbRoleToUserRole(role.role || role.role_id) : 'customer';
      
      return {
        id: role?.id || profile.id, // Fallback to profile.id if no role record exists
        user_id: profile.id,
        role: userRole,
        restaurant_id: role?.restaurant_id || null,
        created_at: profile.created_at || role?.created_at || "N/A",
        updated_at: role?.updated_at || profile.created_at || "N/A",
        is_active: profile.is_active ?? true,
        last_login: profile.last_login,
        profiles: {
          first_name: profile.first_name ?? "",
          last_name: profile.last_name ?? "",
          email: profile.email ?? "",
          is_active: profile.is_active ?? true,
          last_login: profile.last_login,
        },
      };
    });

    // Also check if there are any roles that don't have a profile (unlikely but possible)
    const profileIds = new Set(profilesData.map(p => p.id));
    rolesData?.forEach(role => {
      if (!profileIds.has(role.user_id)) {
        const userRole = mapDbRoleToUserRole(role.role || role.role_id);
        transformedData.push({
          id: role.id,
          user_id: role.user_id,
          role: userRole,
          restaurant_id: role.restaurant_id,
          created_at: role.created_at || "N/A",
          updated_at: role.updated_at || "N/A",
          is_active: true,
          profiles: null
        });
      }
    });

    return transformedData;
  } catch (error) {
    return handleApiError(error, { context: 'get_all_user_roles' });
  }
};

export const checkUserHasRoleOrHigher = async (userId: string, requiredRole: UserRole): Promise<boolean | ApiErrorResponse> => {
  try {
    // Use unified security level check
    const { data, error } = await supabase.rpc("has_role_level", {
      _user_id: userId,
      _min_level: getRoleLevel(requiredRole)
    });

    if (error) throw error;
    return data ?? false;
  } catch (error) {
    return handleApiError(error, { 
      context: 'check_user_has_role_or_higher',
      additionalInfo: { userId, requiredRole }
    });
  }
};

export const getUserRoleStats = async (): Promise<Record<UserRole, number>> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role, role_id");

    if (error) throw error;

    const stats: Record<UserRole, number> = {
      customer: 0,
      restaurant_staff: 0,
      inventory_manager: 0,
      restaurant_manager: 0,
      restaurant_owner: 0,
      admin: 0,
      system_admin: 0,
      superadmin: 0,
    };

    data?.forEach((item) => {
      // Map database role to UserRole type
      const userRole = mapDbRoleToUserRole(item.role || item.role_id);
      if (userRole in stats) {
        stats[userRole]++;
      }
    });

    return stats;
  } catch (error) {
    handleApiError(error);
    return {
      customer: 0,
      restaurant_staff: 0,
      inventory_manager: 0,
      restaurant_manager: 0,
      restaurant_owner: 0,
      admin: 0,
      system_admin: 0,
      superadmin: 0,
    };
  }
};

/**
 * Get all superadmins
 */
export const getSuperAdmins = async (): Promise<UserWithRoleProfile[] | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq("role", "superadmin");

    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      role: 'superadmin' as UserRole,
      profiles: item.profiles as any
    }));
  } catch (error) {
    return handleApiError(error, { context: 'get_super_admins' });
  }
};
