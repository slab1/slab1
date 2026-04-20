import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';
import { Restaurant } from '@/api/types';
import { errorTracker } from '@/utils/error-tracking';

export interface Favorite {
  id: string;
  user_id: string;
  restaurant_id: string;
  created_at: string;
  restaurant?: Restaurant;
}

export const favoritesApi = {
  // Add restaurant to favorites
  add: async (restaurantId: string): Promise<boolean> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Check if already favorited
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (existing) {
        return true; // Already favorited
      }

      const { error } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: user.id,
          restaurant_id: restaurantId
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'add_favorite',
        restaurantId
      });
      handleApiError(error);
      return false;
    }
  },

  // Remove restaurant from favorites
  remove: async (restaurantId: string): Promise<boolean> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'remove_favorite',
        restaurantId
      });
      handleApiError(error);
      return false;
    }
  },

  // Toggle favorite status
  toggle: async (restaurantId: string): Promise<{ isFavorite: boolean; success: boolean }> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Check current status
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (existing) {
        // Remove from favorites
        await favoritesApi.remove(restaurantId);
        return { isFavorite: false, success: true };
      } else {
        // Add to favorites
        await favoritesApi.add(restaurantId);
        return { isFavorite: true, success: true };
      }
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'toggle_favorite',
        restaurantId
      });
      handleApiError(error);
      return { isFavorite: false, success: false };
    }
  },

  // Get user's favorite restaurants
  getUserFavorites: async (): Promise<Favorite[]> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          user_id,
          restaurant_id,
          created_at,
          restaurant:restaurant_id (
            id,
            name,
            cuisine_type,
            price_range,
            rating,
            image_url,
            restaurant_locations (
              id,
              address,
              city,
              state
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the response to our Favorite type
      return (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        restaurant_id: item.restaurant_id,
        created_at: item.created_at,
        restaurant: item.restaurant ? {
          ...item.restaurant,
          cuisine: item.restaurant.cuisine_type, // Map cuisine_type to cuisine
        } : undefined
      })) as Favorite[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_user_favorites'
      });
      handleApiError(error);
      return [];
    }
  },

  // Check if restaurant is favorited by user
  isFavorite: async (restaurantId: string): Promise<boolean> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'check_is_favorite',
        restaurantId
      });
      handleApiError(error);
      return false;
    }
  },

  // Get favorite count for a restaurant
  getFavoriteCount: async (restaurantId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_favorite_count',
        restaurantId
      });
      handleApiError(error);
      return 0;
    }
  },

  // Get popular restaurants by favorites
  getPopularByFavorites: async (limit: number = 10): Promise<Restaurant[]> => {
    try {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_locations (
            id,
            address,
            city,
            state
          )
        `)
        .order('rating', { ascending: false })
        .limit(limit);

      if (fallbackError) throw fallbackError;
      return (fallbackData || []) as unknown as Restaurant[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_popular_by_favorites',
        limit
      });
      handleApiError(error);
      return [];
    }
  },

  // Get user's favorite cuisines
  getFavoriteCuisines: async (): Promise<string[]> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          restaurant:restaurant_id (
            cuisine_type
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Count cuisines and return most popular
      const cuisineCount: Record<string, number> = {};
      data?.forEach((fav: any) => {
        const cuisine = fav.restaurant?.cuisine_type;
        if (cuisine) {
          cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
        }
      });

      return Object.entries(cuisineCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([cuisine]) => cuisine);
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_favorite_cuisines'
      });
      handleApiError(error);
      return [];
    }
  }
};
