
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { UserRole } from "./types";

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
    
  signup: async (firstName: string, lastName: string, email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleApiError(error);
  }
},
    
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getUserRole: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return data?.role as UserRole;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
