import { supabase, testDatabaseConnection } from "@/integrations/supabase/client";
import { handleApiError } from "../utils";
import { Restaurant } from "../types";
import { restaurantGalleryApi } from "./gallery";
import { errorTracker } from "@/utils/error-tracking";

export const restaurantApi = {
  getAll: async (): Promise<Restaurant[]> => {
    try {
      // Test database connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        console.warn('Database connection failed, returning empty results');
        return [];
      }

      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          *,
          locations:restaurant_locations(
            id,
            restaurant_id,
            address,
            contact_info,
            coordinates,
            is_primary,
            timezone,
            created_at
          )
        `);

      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'get_all_restaurants_api'
        });
        throw error;
      }
      
      if (!data) {
        return [];
      }

      // Filter out any null entries and ensure we have valid data
      const validRestaurants = data.filter(restaurant => restaurant && restaurant.id);
      
      return validRestaurants as unknown as Restaurant[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_all_restaurants_api_catch'
      });
      console.warn('Failed to fetch restaurants:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  getById: async (id: string): Promise<Restaurant | null> => {
    try {
      // Test database connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        console.warn('Database connection failed, returning null');
        return null;
      }

      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          *,
          locations:restaurant_locations(*),
          gallery:restaurant_gallery(*),
          settings:restaurant_settings(*),
          menuCategories:menu_categories(*, items:menu_items!fk_menu_items_category(*))
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error('Supabase error fetching restaurant by ID:', error);
        throw error;
      }
      return data as unknown as Restaurant;
    } catch (error) {
      console.error('Caught error in getById:', error);
      return null;
    }
  },

  getBySlug: async (slug: string): Promise<Restaurant | null> => {
    try {
      // Test database connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        console.warn('Database connection failed, returning null');
        return null;
      }

      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          *,
          locations:restaurant_locations(*),
          gallery:restaurant_gallery(*),
          settings:restaurant_settings(*),
          menuCategories:menu_categories(*, items:menu_items!fk_menu_items_category(*))
        `)
        .ilike("slug", slug)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching restaurant by slug:', error);
        throw error;
      }
      return data as unknown as Restaurant;
    } catch (error) {
      console.error('Caught error in getBySlug:', error);
      return null;
    }
  },

  create: async (restaurant: Omit<Restaurant, "id" | "created_at" | "updated_at" | "locations" | "menuCategories" | "gallery"> & { slug?: string }): Promise<Restaurant | null> => {
    try {
      const slug = restaurant.slug || 
        `${restaurant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.random().toString(36).substring(2, 7)}`;

      // Build clean insert object
      const restaurantData: Record<string, unknown> = {
        name: restaurant.name,
        slug,
        cuisine_type: restaurant.cuisine,
        description: restaurant.description,
        price_range: restaurant.price,
        image_url: restaurant.image_url,
        rating: restaurant.rating,
        opening_hours: restaurant.opening_hours,
        is_active: restaurant.is_active ?? true,
        status: restaurant.status || 'pending',
      };

      const { data, error } = await supabase
        .from("restaurants")
        .insert([restaurantData] as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Restaurant;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<Omit<Restaurant, "id" | "created_at" | "updated_at" | "locations" | "menuCategories" | "gallery">>): Promise<Restaurant | null> => {
    try {
      const updateData = {
        name: updates.name,
        cuisine: updates.cuisine,
        description: updates.description,
        price: updates.price,
        image_url: updates.image_url,
        rating: updates.rating,
        features: updates.features,
        opening_hours: updates.opening_hours,
        admin_id: updates.admin_id,
        status: updates.status,
        is_active: updates.is_active
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
      );

      const { data, error } = await supabase
        .from("restaurants")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Restaurant;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  // Gallery methods
  getGallery: restaurantGalleryApi.getGallery,
  addGalleryImage: restaurantGalleryApi.addGalleryImage,
  deleteGalleryImage: restaurantGalleryApi.deleteGalleryImage,
  updateGalleryImage: restaurantGalleryApi.updateGalleryImage
};

export default restaurantApi;
