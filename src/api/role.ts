
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { UserRole, RoleGroup, ROLE_HIERARCHY, getRoleLevel } from "./types";

// Removed local ROLE_HIERARCHY and ROLE_GROUPS as they are now in types.ts

export const roleApi = {
  getRoleStats: async (): Promise<Record<string, number>> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role");

      if (error) throw error;

      const stats: Record<string, number> = {
        customer: 0,
        restaurant_staff: 0,
        inventory_manager: 0,
        restaurant_manager: 0,
        restaurant_owner: 0,
        system_admin: 0,
        superadmin: 0,
        admin: 0,
      };

      data?.forEach((item) => {
        if (item.role in stats) {
          stats[item.role as string]++;
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
        system_admin: 0,
        superadmin: 0,
        admin: 0,
      };
    }
  },

  hasPermission: async (userId: string, requiredRole: UserRole): Promise<boolean> => {
    try {
      // Use security definer function for role level check
      const { data, error } = await supabase.rpc("has_role_level", {
        _user_id: userId,
        _min_level: getRoleLevel(requiredRole)
      });

      if (error) return false;
      return data ?? false;
    } catch (error) {
      return false;
    }
  },

  canManageRole: async (managerRole: UserRole, targetRole: UserRole): Promise<boolean> => {
    if (managerRole === 'superadmin') return true;
    return getRoleLevel(managerRole) > getRoleLevel(targetRole);
  },

  getManageableRoles: (userRole: UserRole): UserRole[] => {
    if (userRole === 'superadmin') {
      return Object.keys(ROLE_HIERARCHY) as UserRole[];
    }
    const userLevel = getRoleLevel(userRole);
    return (Object.keys(ROLE_HIERARCHY) as UserRole[])
      .filter((role) => getRoleLevel(role) < userLevel);
  },

  getRoleGroup: (role: UserRole): RoleGroup => {
    return ROLE_HIERARCHY[role]?.group || 'customer';
  },

  hasRoleGroup: async (userId: string, group: RoleGroup): Promise<boolean> => {
    try {
      // Use security definer function for role group check
      const { data, error } = await supabase.rpc("has_role_group", {
        _user_id: userId,
        _group_name: group
      });

      if (error) return false;
      return data ?? false;
    } catch (error) {
      return false;
    }
  },

  canAccessRestaurant: async (userId: string, restaurantId: string): Promise<boolean> => {
    try {
      // Use security definer function for restaurant access check
      const { data, error } = await supabase.rpc("can_access_restaurant", {
        _user_id: userId,
        _restaurant_id: restaurantId
      });

      if (error) return false;
      return data ?? false;
    } catch (error) {
      return false;
    }
  },
  
  canManageRestaurant: async (userId: string, restaurantId: string): Promise<boolean> => {
    try {
      // Use security definer function for restaurant management check
      const { data, error } = await supabase.rpc("can_manage_restaurant", {
        _user_id: userId,
        _restaurant_id: restaurantId
      });

      if (error) return false;
      return data ?? false;
    } catch (error) {
      return false;
    }
  },
};
