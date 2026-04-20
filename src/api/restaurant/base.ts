import { supabase } from "../../integrations/supabase/client";
import { handleApiError } from "../utils";
import { Restaurant } from "../types";
import { errorTracker } from "@/utils/error-tracking";

// Base restaurant operations
export const restaurantBaseApi = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          *,
          locations:restaurant_locations!restaurant_locations_restaurant_id_fkey(*)
        `)
        .order("name");

      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'get_all_restaurants'
        });
        return handleApiError(error);
      }

      return data || [];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_all_restaurants_catch'
      });
      return handleApiError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          *,
          locations:restaurant_locations!restaurant_locations_restaurant_id_fkey(*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'get_restaurant_by_id',
          restaurantId: id
        });
        return handleApiError(error);
      }

      return data;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_restaurant_by_id_catch',
        restaurantId: id
      });
      return handleApiError(error);
    }
  },

  create: async (restaurantData: Record<string, unknown>) => {
    try {
      // Build a clean insert object with only known fields - use 'as any' for insert to bypass type checking
      const insertData: Record<string, unknown> = {
        name: restaurantData.name as string,
        slug: restaurantData.slug as string || `${(restaurantData.name as string || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        cuisine_type: restaurantData.cuisine_type || restaurantData.cuisine,
        description: restaurantData.description,
        price_range: restaurantData.price_range || restaurantData.price,
        image_url: restaurantData.image_url,
        rating: restaurantData.rating,
        opening_hours: restaurantData.opening_hours,
        is_active: restaurantData.is_active ?? true,
        status: restaurantData.status || 'pending',
      };

      const { data, error } = await supabase
        .from("restaurants")
        .insert([insertData] as any)
        .select();

      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'create_restaurant',
          restaurantName: restaurantData.name as string
        });
        return handleApiError(error);
      }

      return data ? data[0] : null;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'create_restaurant_catch',
        restaurantName: restaurantData.name as string
      });
      return handleApiError(error);
    }
  },

  update: async (id: string, restaurantData: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .update(restaurantData)
        .eq("id", id)
        .select();

      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'update_restaurant',
          restaurantId: id
        });
        return handleApiError(error);
      }

      return data ? data[0] : null;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'update_restaurant_catch',
        restaurantId: id
      });
      return handleApiError(error);
    }
  },

  delete: async (id: string, reason?: string) => {
    try {
      // If a reason is provided, try to log the deletion (table may not exist)
      if (reason) {
        try {
          const { error: logError } = await (supabase as any)
            .from("restaurant_deletion_logs")
            .insert([{
              restaurant_id: id,
              reason,
              deleted_at: new Date().toISOString(),
              deleted_by: (await supabase.auth.getUser()).data.user?.id
            }]);

          if (logError) {
            // Log error but don't fail the deletion
            errorTracker.captureError(logError, 'warning', {
              context: 'log_restaurant_deletion',
              restaurantId: id
            });
          }
        } catch (logError) {
          // Silently fail if deletion logs table doesn't exist
          console.warn('Could not log restaurant deletion:', logError);
        }
      }
      
      // Delete the restaurant
      const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", id);

      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'delete_restaurant',
          restaurantId: id
        });
        return handleApiError(error);
      }

      return { success: true };
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'delete_restaurant_catch',
        restaurantId: id
      });
      return handleApiError(error);
    }
  }
};
