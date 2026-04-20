
import { supabase } from "../../integrations/supabase/client";
import { handleApiError } from "../utils";
import { RestaurantGalleryImage } from "../types";
import { errorTracker } from "@/utils/error-tracking";

/**
 * Restaurant gallery operations
 */
export const restaurantGalleryApi = {
  getGallery: async (restaurantId: string): Promise<RestaurantGalleryImage[]> => {
    try {
      const { data, error } = await supabase
        .from("restaurant_gallery")
        .select("*")
        .eq("restaurant_id", restaurantId);
        
      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'get_gallery',
          restaurantId
        });
        return [];
      }
      
      return (data || []) as RestaurantGalleryImage[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_gallery_catch',
        restaurantId
      });
      return [];
    }
  },
  
  addGalleryImage: async (image: Partial<RestaurantGalleryImage>): Promise<RestaurantGalleryImage | null> => {
    try {
      const { data, error } = await supabase
        .from("restaurant_gallery")
        .insert({
          restaurant_id: image.restaurant_id,
          url: image.url,
          caption: image.caption || ""
        })
        .select()
        .single();
        
      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'add_gallery_image',
          restaurantId: image.restaurant_id
        });
        return null;
      }
      
      return data as RestaurantGalleryImage;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'add_gallery_image_catch',
        restaurantId: image.restaurant_id
      });
      return null;
    }
  },
  
  deleteGalleryImage: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("restaurant_gallery")
        .delete()
        .eq("id", id);
        
      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'delete_gallery_image',
          imageId: id
        });
        return false;
      }
      
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'delete_gallery_image_catch',
        imageId: id
      });
      return false;
    }
  },
  
  updateGalleryImage: async (id: string, updates: Partial<RestaurantGalleryImage>): Promise<RestaurantGalleryImage | null> => {
    try {
      const { data, error } = await supabase
        .from("restaurant_gallery")
        .update({
          url: updates.url,
          caption: updates.caption
        })
        .eq("id", id)
        .select()
        .single();
        
      if (error) {
        errorTracker.captureError(error, 'error', {
          context: 'update_gallery_image',
          imageId: id
        });
        return null;
      }
      
      return data as RestaurantGalleryImage;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'update_gallery_image_catch',
        imageId: id
      });
      return null;
    }
  }
};
