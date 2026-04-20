
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { Profile } from "./types";
import { errorTracker } from "@/utils/error-tracking";

// Define the expected structure of Supabase response for profiles
interface ProfileFromDb {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Convert database format to frontend Profile format
const mapProfileData = (data: ProfileFromDb): Profile => ({
  id: data.id,
  email: data.email,
  first_name: data.first_name || "",
  last_name: data.last_name || "",
  phone_number: data.phone_number || "",
  address: data.address || "",
  avatar_url: data.avatar_url || "",
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const profileApi = {
  getById: async (
    userId: string
  ): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, email, first_name, last_name, full_name, phone_number, address, avatar_url, created_at, updated_at"
        )
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Handle both old (full_name) and new (first_name/last_name) schemas
      const profile = data as any;
      return mapProfileData({
        ...profile,
        first_name: profile.first_name ?? profile.full_name?.split(' ')[0] ?? null,
        last_name: profile.last_name ?? profile.full_name?.split(' ').slice(1).join(' ') ?? null,
      } as ProfileFromDb);
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_profile_by_id',
        userId
      });
      handleApiError(error);
      return null;
    }
  },

  getByEmail: async (
    email: string
  ): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, email, first_name, last_name, full_name, phone_number, address, avatar_url, created_at, updated_at"
        )
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const profile = data as any;
      return mapProfileData({
        ...profile,
        first_name: profile.first_name ?? profile.full_name?.split(' ')[0] ?? null,
        last_name: profile.last_name ?? profile.full_name?.split(' ').slice(1).join(' ') ?? null,
      } as ProfileFromDb);
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  update: async (
    userId: string,
    profileData: Partial<Profile>
  ): Promise<Profile | null> => {
    try {
      const updatedData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || null,
        phone_number: profileData.phone_number,
        address: profileData.address,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .update(updatedData)
        .eq("id", userId)
        .select(
          "id, email, first_name, last_name, full_name, phone_number, address, avatar_url, created_at, updated_at"
        );

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Handle both old (full_name) and new (first_name/last_name) schemas
      const profile = data[0] as any;
      return mapProfileData({
        ...profile,
        first_name: profile.first_name ?? profile.full_name?.split(' ')[0] ?? null,
        last_name: profile.last_name ?? profile.full_name?.split(' ').slice(1).join(' ') ?? null,
      } as ProfileFromDb);
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'update_profile',
        userId
      });
      handleApiError(error);
      return null;
    }
  },

  getAll: async (): Promise<Profile[]> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, email, first_name, last_name, full_name, phone_number, address, avatar_url, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Handle both old (full_name) and new (first_name/last_name) schemas
      return (data as any[]).map(profile => mapProfileData({
        ...profile,
        first_name: profile.first_name ?? profile.full_name?.split(' ')[0] ?? null,
        last_name: profile.last_name ?? profile.full_name?.split(' ').slice(1).join(' ') ?? null,
      } as ProfileFromDb));
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_all_profiles'
      });
      handleApiError(error);
      return [];
    }
  },
};
