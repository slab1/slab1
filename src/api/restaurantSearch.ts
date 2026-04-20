import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';
import { Restaurant } from '@/api/types';
import { errorTracker } from '@/utils/error-tracking';

export interface SearchFilters {
  query?: string;
  cuisine?: string[];
  priceRange?: string[];
  rating?: number;
  location?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  features?: string[];
  sortBy?: 'rating' | 'price' | 'distance' | 'name' | 'reviews';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  restaurants: Restaurant[];
  total: number;
  filters: {
    availableCuisines: string[];
    availablePriceRanges: string[];
    availableFeatures: string[];
    totalResults: number;
  };
}

export interface ComparisonData {
  restaurant: Restaurant;
  userRating?: number;
  userReview?: string;
  isFavorite?: boolean;
  distance?: number;
  averagePrice?: number;
}

export const restaurantSearchApi = {
  // Enhanced search with multiple filters
  search: async (filters: SearchFilters): Promise<SearchResult> => {
    try {
      let query = supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_locations (
            id,
            address,
            city,
            state,
            zip,
            phone_number,
            latitude,
            longitude,
            operating_hours
          )
        `, { count: 'exact' });

      // Text search
      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,cuisine.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      // Cuisine filter
      if (filters.cuisine && filters.cuisine.length > 0) {
        query = query.in('cuisine', filters.cuisine);
      }

      // Price range filter
      if (filters.priceRange && filters.priceRange.length > 0) {
        query = query.in('price', filters.priceRange);
      }

      // Rating filter
      if (filters.rating) {
        query = query.gte('rating', filters.rating);
      }

      // Location-based filtering
      if (filters.location) {
        query = query.ilike('restaurant_locations.city', `%${filters.location}%`);
      }

      // Distance-based filtering (requires latitude/longitude)
      if (filters.latitude && filters.longitude && filters.distance) {
        // This would require PostGIS or similar geospatial extension
        // For now, we'll use a simplified bounding box approach
        const latDelta = filters.distance / 111; // Approximate degrees per km
        const lonDelta = filters.distance / (111 * Math.cos(filters.latitude * Math.PI / 180));

        query = query
          .gte('restaurant_locations.latitude', filters.latitude - latDelta)
          .lte('restaurant_locations.latitude', filters.latitude + latDelta)
          .gte('restaurant_locations.longitude', filters.longitude - lonDelta)
          .lte('restaurant_locations.longitude', filters.longitude + lonDelta);
      }

      // Features filter (if restaurants have features array)
      if (filters.features && filters.features.length > 0) {
        // This assumes features are stored as a JSON array or text array
        // Implementation depends on actual database schema
        filters.features.forEach(feature => {
          query = query.ilike('features', `%${feature}%`);
        });
      }

      // Sorting
      if (filters.sortBy) {
        const order = filters.sortOrder || 'desc';
        query = query.order(filters.sortBy, { ascending: order === 'asc' });
      } else {
        // Default sort by rating
        query = query.order('rating', { ascending: false });
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Get filter options for UI
      const filtersData = await restaurantSearchApi.getAvailableFilters();

      return {
        restaurants: (data || []) as unknown as Restaurant[],
        total: count || 0,
        filters: filtersData
      };
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'restaurant_search',
        filters
      });
      handleApiError(error);
      return {
        restaurants: [],
        total: 0,
        filters: {
          availableCuisines: [],
          availablePriceRanges: [],
          availableFeatures: [],
          totalResults: 0
        }
      };
    }
  },

  // Get available filter options
  getAvailableFilters: async () => {
    try {
      // Get unique cuisines
      const { data: cuisinesData, error: cuisinesError } = await supabase
        .from('restaurants')
        .select('cuisine')
        .not('cuisine', 'is', null);

      // Get unique price ranges
      const { data: pricesData, error: pricesError } = await supabase
        .from('restaurants')
        .select('price')
        .not('price', 'is', null);

      // Get unique features (assuming features is a text field with comma-separated values)
      const { data: featuresData, error: featuresError } = await supabase
        .from('restaurants')
        .select('features')
        .not('features', 'is', null);

      const availableCuisines = cuisinesError ? [] :
        [...new Set(cuisinesData?.map(r => r.cuisine).filter(Boolean) || [])];

      const availablePriceRanges = pricesError ? [] :
        [...new Set(pricesData?.map(r => r.price).filter(Boolean) || [])];

      const availableFeatures = featuresError ? [] :
        [...new Set(
          featuresData?.flatMap(r =>
            r.features ? r.features.split(',').map((f: string) => f.trim()) : []
          ).filter(Boolean) || []
        )];

      return {
        availableCuisines,
        availablePriceRanges,
        availableFeatures,
        totalResults: await getTotalRestaurantCount()
      };
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_available_filters'
      });
      return {
        availableCuisines: [],
        availablePriceRanges: [],
        availableFeatures: [],
        totalResults: 0
      };
    }
  },

  // Advanced search with full-text search and ranking
  advancedSearch: async (query: string, filters: SearchFilters): Promise<SearchResult> => {
    try {
      // Use PostgreSQL full-text search for better results
      const searchQuery = query.trim();
      const tsQuery = searchQuery.split(' ').join(' | ');

      const { data, error } = await supabase.rpc('search_restaurants' as any, {
        search_query: tsQuery,
        cuisine_filter: filters.cuisine || [],
        price_filter: filters.priceRange || [],
        min_rating: filters.rating || 0,
        limit_count: filters.limit || 20,
        offset_count: filters.offset || 0
      });
      const resultData = data as any;

      if (error) {
        // Fallback to basic search if advanced search fails
        console.warn('Advanced search failed, falling back to basic search:', error);
        return restaurantSearchApi.search({ ...filters, query });
      }

      // Get filter options
      const filtersData = await restaurantSearchApi.getAvailableFilters();

      return {
        restaurants: (resultData?.restaurants || []) as unknown as Restaurant[],
        total: resultData?.total || 0,
        filters: filtersData
      };
    } catch (error) {
      // Fallback to basic search if advanced search fails
      console.warn('Advanced search failed, falling back to basic search:', error);
      return restaurantSearchApi.search({ ...filters, query });
    }
  },

  // Restaurant comparison feature
  compareRestaurants: async (restaurantIds: string[]): Promise<ComparisonData[]> => {
    try {
      if (!restaurantIds.length || restaurantIds.length > 4) {
        throw new Error('Must compare 1-4 restaurants');
      }

      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_locations (
            id,
            address,
            city,
            state,
            latitude,
            longitude
          )
        `)
        .in('id', restaurantIds);

      if (error) throw error;

      // Get user's favorites and reviews for these restaurants
      const user = (await supabase.auth.getUser()).data.user;
      let favorites: string[] = [];
      let userReviews: any[] = [];

      if (user) {
        const { data: favData } = await supabase
          .from('user_favorites' as any)
          .select('restaurant_id')
          .eq('user_id', user.id)
          .in('restaurant_id', restaurantIds);

        favorites = (favData as any)?.map((f: any) => f.restaurant_id) || [];

        const reviewData: any[] = [];
        userReviews = reviewData;
      }

      // Transform data for comparison
      const comparisonData: ComparisonData[] = ((data || []) as any[]).map((restaurant: any) => {
        const userReview = userReviews.find(r => r.restaurant_id === restaurant.id);
        const isFavorite = favorites.includes(restaurant.id);

        return {
          restaurant,
          userRating: userReview?.rating,
          userReview: userReview?.content,
          isFavorite,
          distance: calculateDistance(restaurant.restaurant_locations?.[0]),
          averagePrice: estimateAveragePrice(restaurant.price)
        };
      });

      return comparisonData;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'compare_restaurants',
        restaurantIds
      });
      handleApiError(error);
      return [];
    }
  },

  // Get trending/popular restaurants
  getTrending: async (limit: number = 10): Promise<Restaurant[]> => {
    try {
      // Get all restaurants
      const { data, error } = await supabase
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
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;
      
      // Transform data to ensure correct typing with fallback location
      const restaurants = (data || []).map((restaurant: any) => ({
        ...restaurant,
        locations: [] // Empty locations array - will be handled by the card
      }));

      return restaurants as unknown as Restaurant[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_trending_restaurants',
        limit
      });
      handleApiError(error);
      return [];
    }
  },

  // Get restaurants near user location
  getNearby: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<Restaurant[]> => {
    try {
      // Fetch all restaurants with locations
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_locations!inner (
            id,
            address,
            coordinates
          )
        `)
        .order('rating', { ascending: false })
        .limit(limit * 2); // Fetch more to filter by distance

      if (error) throw error;

      // Filter and calculate actual distances using coordinates (POINT type)
      const restaurantsWithDistance = (data || [])
        .map(restaurant => {
          const loc = restaurant.restaurant_locations?.[0];
          // Parse coordinates from POINT type (stored as string like "(lon,lat)")
          let locLat: number | undefined;
          let locLon: number | undefined;
          
          if (loc?.coordinates) {
            // Coordinates stored as POINT type - format is (x,y) where x=lon, y=lat
            const coordStr = String(loc.coordinates);
            const match = coordStr.match(/\(([^,]+),([^)]+)\)/);
            if (match) {
              locLon = parseFloat(match[1]);
              locLat = parseFloat(match[2]);
            }
          }
          
          const distance = locLat && locLon 
            ? calculateDistance({ latitude: locLat, longitude: locLon }, latitude, longitude)
            : undefined;
            
          return {
            ...restaurant,
            locations: restaurant.restaurant_locations,
            distance
          };
        })
        .filter(r => r.distance === undefined || r.distance <= radiusKm)
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
        .slice(0, limit);

      return restaurantsWithDistance as unknown as Restaurant[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_nearby_restaurants',
        latitude,
        longitude,
        radiusKm,
        limit
      });
      handleApiError(error);
      return [];
    }
  }
};

// Helper functions
async function getTotalRestaurantCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    return count || 0;
  } catch (error) {
    return 0;
  }
}

function calculateDistance(
  location?: { latitude?: number; longitude?: number },
  userLat?: number,
  userLon?: number
): number | undefined {
  // Get user's location from geolocation API if not provided
  if (typeof navigator !== 'undefined' && navigator.geolocation && !userLat && !userLon) {
    // This would be handled by a geolocation hook
    return undefined;
  }

  if (!location?.latitude || !location?.longitude || !userLat || !userLon) {
    return undefined;
  }

  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = (location.latitude - userLat) * Math.PI / 180;
  const dLon = (location.longitude - userLon) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function estimateAveragePrice(priceRange: string): number {
  // Convert price range symbols to estimated dollar amounts
  const priceMap: Record<string, number> = {
    '$': 25,
    '$$': 50,
    '$$$': 75,
    '$$$$': 100
  };

  return priceMap[priceRange] || 50;
}
