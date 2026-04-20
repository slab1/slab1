import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "@/utils/error-handling";
import { AdvancedCacheManager } from "@/utils/advanced-cache-manager";
import type { Restaurant } from "@/api/types";

export interface RecommendationFilters {
  cuisine?: string;
  location?: string;
  priceRange?: [number, number];
  rating?: number;
  userId?: string;
}

export interface RecommendationResult {
  restaurants: Restaurant[];
  totalCount: number;
  hasMore: boolean;
}

class OptimizedRecommendationService {
  private cache = new AdvancedCacheManager<RecommendationResult>({
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    enablePersistence: true,
  });

  private getCacheKey(filters: RecommendationFilters, limit: number, offset: number): string {
    return JSON.stringify({ filters, limit, offset });
  }

  async getPersonalizedRecommendations(
    filters: RecommendationFilters,
    limit = 10,
    offset = 0
  ): Promise<RecommendationResult> {
    const cacheKey = this.getCacheKey(filters, limit, offset);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Build optimized query with proper indexing
      let query = supabase
        .from('restaurants')
        .select(`
          id,
          name,
          description,
          cuisine,
          price,
          image_url,
          created_at,
          updated_at,
          admin_id,
          rating
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters efficiently
      if (filters.cuisine) {
        query = query.ilike('cuisine', `%${filters.cuisine}%`);
      }

      if (filters.location) {
        query = query.or(
          `restaurant_locations.city.ilike.%${filters.location}%,restaurant_locations.state.ilike.%${filters.location}%`
        );
      }

      if (filters.priceRange) {
        query = query
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1]);
      }

      const { data: restaurants, error, count } = await query;

      if (error) {
        throw ErrorHandler.handle(error, {
          context: 'getPersonalizedRecommendations',
          filters
        });
      }

      const result: RecommendationResult = {
        restaurants: (restaurants as unknown as Restaurant[]) || [],
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit,
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      throw ErrorHandler.handle(error, {
        context: 'OptimizedRecommendationService.getPersonalizedRecommendations',
        userId: filters.userId,
      });
    }
  }

  async getPopularRestaurants(limit = 6): Promise<Restaurant[]> {
    const cacheKey = `popular_restaurants_${limit}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached.restaurants;
    }

    try {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          description,
          cuisine,
          price,
          image_url,
          created_at,
          updated_at,
          admin_id,
          rating
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw ErrorHandler.handle(error, {
          context: 'getPopularRestaurants'
        });
      }

      const result: RecommendationResult = {
        restaurants: (restaurants as unknown as Restaurant[]) || [],
        totalCount: restaurants?.length || 0,
        hasMore: false,
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return (restaurants as unknown as Restaurant[]) || [];
    } catch (error) {
      throw ErrorHandler.handle(error, {
        context: 'OptimizedRecommendationService.getPopularRestaurants',
      });
    }
  }

  async getNearbyRestaurants(
    userLocation: { lat: number; lng: number },
    radiusKm = 10,
    limit = 10
  ): Promise<Restaurant[]> {
    const cacheKey = `nearby_${userLocation.lat}_${userLocation.lng}_${radiusKm}_${limit}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached.restaurants;
    }

    try {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          description,
          cuisine,
          price,
          image_url,
          created_at,
          updated_at,
          admin_id,
          rating
        `)
        .limit(limit);

      if (error) {
        throw ErrorHandler.handle(error, {
          context: 'getNearbyRestaurants',
          userLocation
        });
      }

      const result: RecommendationResult = {
        restaurants: (restaurants as unknown as Restaurant[]) || [],
        totalCount: restaurants?.length || 0,
        hasMore: false,
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return (restaurants as unknown as Restaurant[]) || [];
    } catch (error) {
      throw ErrorHandler.handle(error, {
        context: 'OptimizedRecommendationService.getNearbyRestaurants',
        userLocation,
        radiusKm
      });
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.getStats().size;
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}

export const optimizedRecommendationService = new OptimizedRecommendationService();