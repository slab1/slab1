import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";

export const storageApi = {
  /**
   * Upload a file to a specific bucket and path
   */
  uploadFile: async (
    bucket: string,
    path: string,
    file: File,
    options: { upsert?: boolean } = { upsert: true }
  ) => {
    try {
      // Ensure path is unique by adding a timestamp if it's a general path
      const uniquePath = path.includes('.') ? path : `${path}/${Date.now()}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniquePath, file, options);

      if (error) {
        // If it's a "Duplicate" error and we're not using upsert, or even if we are
        if (error.message?.includes('Duplicate')) {
          const { data: retryData, error: retryError } = await supabase.storage
            .from(bucket)
            .upload(`${uniquePath}-${Date.now()}`, file, options);
          
          if (retryError) throw retryError;
          
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(`${uniquePath}-${Date.now()}`);
            
          return { data: retryData, publicUrl };
        }
        handleApiError(error, { showToast: false });
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(uniquePath);

      return { data, publicUrl };
    } catch (error) {
      console.error("Storage upload error:", error);
      throw error;
    }
  },

  /**
   * Delete a file from a bucket
   */
  deleteFile: async (bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        handleApiError(error, { showToast: false });
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Storage delete error:", error);
      throw error;
    }
  },

  /**
   * Get a public URL for a file
   */
  getPublicUrl: (bucket: string, path: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return publicUrl;
  },

  /**
   * Extract path from a public URL
   */
  extractPathFromUrl: (url: string, bucket: string) => {
    if (!url) return null;
    const parts = url.split(`${bucket}/`);
    if (parts.length < 2) return null;
    return parts[1].split('?')[0]; // Remove query params if any
  }
};
