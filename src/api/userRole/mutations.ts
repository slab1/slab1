
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../utils";
import { UserRole, ApiErrorResponse } from "../types";
import { UserRoleResponse } from "./types";

export const updateUserRole = async (
  userId: string, 
  role: UserRole, 
  reason: string = "Role updated via Admin Dashboard"
): Promise<UserRoleResponse | ApiErrorResponse> => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;

    // Security Check: Prevent self-downgrade of the last superadmin in frontend as well
    if (currentUserId === userId) {
      const { data: currentRoleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUserId)
        .single();

      if (currentRoleData?.role === 'superadmin' && role !== 'superadmin') {
        // Check if other superadmins exist
        const { count } = await supabase
          .from("user_roles")
          .select("*", { count: 'exact', head: true })
          .eq("role", "superadmin");

        if (count && count <= 1) {
          throw new Error("Cannot downgrade the last Super Admin. Please promote another user first.");
        }
      }
    }

    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .single();

    let data: any = null;
    let error: any = null;

    // Note: We use a custom header or session variable if we wanted to pass 'reason' to the trigger.
    // For now, we'll perform the update and let the trigger log it.
    // Best practice: If custom reasons are critical, use an RPC or a 'last_reason' column.
    
    if (existingRole) {
      const response = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId)
        .select()
        .single();

      data = response.data;
      error = response.error;
    } else {
      const response = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role } as any)
        .select()
        .single();

      data = response.data;
      error = response.error;
    }

    if (error) {
      // Handle RLS violations gracefully
      if (error.code === '42501') {
        throw new Error("You do not have permission to assign this role or modify this user.");
      }
      throw error;
    }

    return {
      id: data?.id,
      role: data?.role as UserRole
    };
  } catch (error) {
    return handleApiError(error, {
      context: 'update_user_role',
      additionalInfo: { userId, role }
    });
  }
};

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<boolean | ApiErrorResponse> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) {
      if (error.code === '42501') {
        throw new Error("You do not have permission to change user status.");
      }
      throw error;
    }

    return true;
  } catch (error) {
    return handleApiError(error, {
      context: 'toggle_user_status',
      additionalInfo: { userId, isActive }
    });
  }
};

export const createUserRole = async (userId: string, role: UserRole): Promise<UserRoleResponse | ApiErrorResponse> => {
  try {
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingRole) {
      return await updateUserRole(userId, role);
    }

    const { data, error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role } as any)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data?.id,
      role: data?.role as UserRole
    };
  } catch (error) {
    return handleApiError(error, { 
      context: 'create_user_role',
      additionalInfo: { userId, role }
    });
  }
};
