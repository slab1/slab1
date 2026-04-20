
import { Restaurant, Chef } from '@/api/types';
import { supabase } from '@/integrations/supabase/client';
import { errorTracker } from '@/utils/error-tracking';

type RecommendationType = 'restaurant' | 'chef' | 'cuisine';

interface RecommendationScore {
  id: string;
  score: number;
  type: RecommendationType;
  name: string;
  image?: string;
  description?: string;
}

export const recommendationService = {
  /**
   * Get personalized recommendations based on user history
   */
  async getUserRecommendations(userId: string, limit: number = 4): Promise<RecommendationScore[]> {
    try {
      // Get user's reservation history
      const { data: reservations } = await supabase
        .from('reservations')
        .select('restaurant_location_id, created_at, party_size')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      // Get user's chef booking history
      const { data: chefBookings } = await supabase
        .from('chef_bookings')
        .select('chef_id, created_at, guest_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Check if we have enough data for recommendations
      if (!reservations?.length && !chefBookings?.length) {
        // Fall back to popular items if no user history
        return await this.getPopularItems(limit);
      }

      // Get the locations data to extract restaurant IDs
      const locationIds = reservations?.map(r => r.restaurant_location_id).filter(Boolean) || [];
      let restaurantIds: string[] = [];
      
      if (locationIds.length) {
        const { data: locations } = await supabase
          .from('restaurant_locations')
          .select('restaurant_id')
          .in('id', locationIds);
        
        restaurantIds = locations?.map(l => l.restaurant_id) || [];
      }

      // Get cuisines from restaurants the user has visited
      const { data: visitedRestaurants } = await supabase
        .from('restaurants')
        .select('id, cuisine')
        .in('id', restaurantIds);

      const visitedCuisines = new Set<string>();
      visitedRestaurants?.forEach(r => {
        if (r.cuisine) {
          visitedCuisines.add(r.cuisine);
        }
      });

      // Find similar restaurants based on cuisine
      let recommendations: RecommendationScore[] = [];
      
      if (visitedCuisines.size) {
        const cuisineArray = Array.from(visitedCuisines);
        
        const { data: similarRestaurants } = await supabase
          .from('restaurants')
          .select('id, name, cuisine, image_url, description, rating')
          .not('id', 'in', `(${restaurantIds.join(',')})`)
          .in('cuisine', cuisineArray)
          .order('rating', { ascending: false })
          .limit(limit);
        
        // Add restaurants to recommendations
        recommendations = [
          ...recommendations,
          ...(similarRestaurants?.map(r => ({
            id: r.id,
            score: (r.rating || 4.0) * 20, // Convert 0-5 rating to 0-100 score
            type: 'restaurant' as RecommendationType,
            name: r.name,
            image: r.image_url,
            description: r.description || `${r.cuisine} restaurant you might enjoy`
          })) || [])
        ];
      }

      // Get chef recommendations based on user bookings
      const chefIds = chefBookings?.map(b => b.chef_id) || [];
      if (chefIds.length) {
        const { data: chefs } = await supabase
          .from('chefs')
          .select('id, name, specialty, image, bio, years_experience, hourly_rate')
          .not('id', 'in', `(${chefIds.join(',')})`)
          .order('years_experience', { ascending: false })
          .limit(Math.ceil(limit / 2));
          
        recommendations = [
          ...recommendations,
          ...(chefs?.map(c => ({
            id: c.id,
            score: (c.years_experience / 20) * 100, // Normalize years experience to a 0-100 score
            type: 'chef' as RecommendationType,
            name: c.name,
            image: c.image || undefined,
            description: `${c.specialty} chef with ${c.years_experience} years experience`
          })) || [])
        ];
      }

      // Sort by score and limit results
      return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_user_recommendations',
        userId,
        limit
      });
      return [];
    }
  },

  /**
   * Get popular items when we don't have user history
   */
  async getPopularItems(limit: number = 4): Promise<RecommendationScore[]> {
    try {
      // Get top rated restaurants
      const { data: topRestaurants } = await supabase
        .from('restaurants')
        .select('id, name, cuisine, image_url, description, rating')
        .order('rating', { ascending: false })
        .limit(Math.ceil(limit / 2));
      
      // Get popular chefs
      const { data: topChefs } = await supabase
        .from('chefs')
        .select('id, name, specialty, image, bio, years_experience')
        .order('years_experience', { ascending: false })
        .limit(Math.floor(limit / 2));
        
      const recommendations: RecommendationScore[] = [
        ...(topRestaurants?.map(r => ({
          id: r.id,
          score: (r.rating || 4.0) * 20,
          type: 'restaurant' as RecommendationType,
          name: r.name,
          image: r.image_url,
          description: r.description || `Popular ${r.cuisine} restaurant`
        })) || []),
        
        ...(topChefs?.map(c => ({
          id: c.id,
          score: (c.years_experience / 20) * 100,
          type: 'chef' as RecommendationType,
          name: c.name,
          image: c.image || undefined,
          description: `${c.specialty} chef with ${c.years_experience} years experience`
        })) || [])
      ];
      
      return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_popular_items',
        limit
      });
      return [];
    }
  }
};
