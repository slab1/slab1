
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { ApiErrorResponse } from "./types";

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  created_at: string;
  updated_at: string;
  helpful_count: number;
  is_verified?: boolean;
}

export interface ReviewWithUser extends Review {
  user: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  user_has_liked?: boolean;
}

export const reviewsApi = {
  getByRestaurantId: async (restaurantId: string): Promise<ReviewWithUser[] | ApiErrorResponse> => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url,
            full_name
          )
        `)
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((review: any) => ({
        ...review,
        user: {
          first_name: review.profiles?.first_name || review.profiles?.full_name?.split(' ')[0] || "",
          last_name: review.profiles?.last_name || review.profiles?.full_name?.split(' ').slice(1).join(' ') || "",
          avatar_url: review.profiles?.avatar_url
        }
      })) as ReviewWithUser[];
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (review: { restaurant_id: string; user_id: string; rating: number; title?: string; content?: string }): Promise<Review | null> => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data as Review;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  addReview: async (review: { restaurant_id: string; user_id: string; rating: number; title?: string; content?: string }): Promise<Review | null> => {
    return reviewsApi.create(review);
  },

  update: async (id: string, updates: Partial<Pick<Review, "rating" | "title" | "content">>): Promise<Review | null> => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Review;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  likeReview: async (reviewId: string, userId: string): Promise<boolean> => {
    try {
      // Use atomic RPC function to prevent race conditions
      const { error } = await supabase.rpc('like_review_atomically', {
        p_review_id: reviewId,
        p_user_id: userId
      });

      if (error) {
        // Handle unique constraint violation (already liked)
        if (error.code === '23505') {
          console.log('Review already liked by user');
          return true;
        }
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error liking review:', error);
      handleApiError(error);
      return false;
    }
  },

  unlikeReview: async (reviewId: string, userId: string): Promise<boolean> => {
    try {
      // Use atomic RPC function to prevent race conditions
      const { error } = await supabase.rpc('unlike_review_atomically', {
        p_review_id: reviewId,
        p_user_id: userId
      });

      if (error) {
        // Handle case where like doesn't exist
        if (error.code === 'PGRST116') {
          console.log('Review like not found');
          return true;
        }
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error unliking review:', error);
      handleApiError(error);
      return false;
    }
  },

  getUserLikes: async (userId: string): Promise<string[] | ApiErrorResponse> => {
    try {
      const { data, error } = await supabase
        .from("review_likes")
        .select("review_id")
        .eq("user_id", userId);

      if (error) throw error;
      return (data || []).map((like: any) => like.review_id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  reportReview: async (report: { review_id: string; user_id: string; reason: string; description?: string }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("review_reports")
        .insert(report);

      if (error) throw error;
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  }
};
