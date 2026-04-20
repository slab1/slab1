
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/api/types';
import { RestaurantFilters, PaginatedRestaurantsResponse } from './enhanced';
import { restaurantCache, cacheUtils } from '@/utils/advanced-cache';
import { errorTracker } from '@/utils/error-tracking';
import { performanceUtils } from '@/utils/performance';
import { tableApi } from '@/api/table';
import { format } from 'date-fns';

// Transform Supabase data to Restaurant type
function transformRestaurantData(rawData: any[]): Restaurant[] {
  return rawData.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    cuisine: item.cuisine,
    rating: item.rating,
    price: item.price,
    image_url: item.image_url,
    features: item.features,
    opening_hours: item.opening_hours || {},
    created_at: item.created_at,
    updated_at: item.updated_at || item.created_at,
    admin_id: item.admin_id || '',
    locations: item.locations || []
  }));
}

export const optimizedRestaurantApi = {
  async getPaginatedWithCache(
    page: number = 1,
    limit: number = 12,
    filters: RestaurantFilters = {}
  ): Promise<PaginatedRestaurantsResponse> {
    const cacheKey = cacheUtils.generateKey('restaurants', { page, limit, filters });
    
    try {
      return await restaurantCache.getOrSet(
        cacheKey,
        async () => {
          return await performanceUtils.measureApiCall(
            () => this.fetchRestaurantsFromDB(page, limit, filters),
            'restaurants-db-fetch'
          );
        },
        5 * 60 * 1000, // 5 minutes TTL
        ['restaurants', `page-${page}`, ...(filters.cuisine || []), filters.city || 'all-cities']
      );
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error('Failed to fetch restaurants'),
        'error',
        { page, limit, filters, cacheKey }
      );
      throw error;
    }
  },

  async fetchRestaurantsFromDB(
    page: number,
    limit: number,
    filters: RestaurantFilters
  ): Promise<PaginatedRestaurantsResponse> {
    // Optimized query - restaurant_locations uses JSONB for address
    let query = supabase
      .from('restaurants')
      .select(`
        id,
        name,
        description,
        cuisine,
        rating,
        price,
        image_url,
        features,
        opening_hours,
        created_at,
        updated_at,
        admin_id,
        locations:restaurant_locations!restaurant_locations_restaurant_id_fkey (
          id,
          address,
          contact_info,
          coordinates,
          is_primary,
          timezone,
          created_at
        )
      `, { count: 'exact' });

    // Apply filters with optimized indexing
    if (filters.favoriteIds) {
      if (filters.favoriteIds.length === 0) {
        // User wants to filter by favorites, but has none. Return empty.
        return {
          restaurants: [],
          totalCount: 0,
          totalPages: 1,
          currentPage: page,
          hasNextPage: false,
        };
      }
      query = query.in('id', filters.favoriteIds);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.cuisine && filters.cuisine.length > 0) {
      query = query.in('cuisine', filters.cuisine);
    }

    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }

    if (filters.priceRange && filters.priceRange.length > 0) {
      query = query.in('price', filters.priceRange);
    }

    // Note: city/state filters won't work directly with JSONB address
    // Would need a database function or client-side filtering

    // Optimized pagination
    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + limit - 1);
      
    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true, nullsFirst: true }).order('rating', { ascending: false, nullsFirst: false });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false, nullsFirst: true }).order('rating', { ascending: false, nullsFirst: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rating':
      default:
        query = query.order('rating', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
        break;
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching paginated restaurants:', error);
      throw error;
    }

    // Transform the data to match Restaurant type
    const transformedRestaurants = transformRestaurantData(data || []);

    return {
      restaurants: transformedRestaurants,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil((count || 0) / limit)
    };
  },

  async getByIds(restaurantIds: string[]): Promise<Restaurant[]> {
    if (!restaurantIds || restaurantIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        id,
        name,
        description,
        cuisine,
        rating,
        price,
        image_url,
        features,
        opening_hours,
        created_at,
        updated_at,
        admin_id,
        locations:restaurant_locations!restaurant_locations_restaurant_id_fkey (
          id,
          address,
          contact_info,
          coordinates,
          is_primary,
          timezone,
          created_at
        )
      `)
      .in('id', restaurantIds);

    if (error) {
      console.error('Error fetching restaurants by IDs:', error);
      throw error;
    }

    return transformRestaurantData(data || []);
  },

  async checkAvailability(locationId: string, partySize: number = 2): Promise<{ availableNow: boolean, nextAvailableSlot: string | null }> {
    try {
        const now = new Date();
        
        // Check for now
        const dateNow = format(now, 'yyyy-MM-dd');
        const timeNow = format(now, 'HH:mm:ss');
        
        // The updated get_available_tables function now handles both location_id and restaurant_id
        const availableTablesNow = await tableApi.getAvailableTables(locationId, dateNow, timeNow, partySize);

        if (availableTablesNow.length > 0) {
            return { availableNow: true, nextAvailableSlot: null };
        }

        // If not available now, find the next available slot
        let nextAvailableSlot: string | null = null;
        
        // Start checking from the next half-hour mark
        const startCheckTime = new Date(now.getTime());
        const currentMinutes = startCheckTime.getMinutes();
        if (currentMinutes < 30) {
            startCheckTime.setMinutes(30, 0, 0);
        } else {
            startCheckTime.setHours(startCheckTime.getHours() + 1, 0, 0, 0);
        }

        // Check fewer slots to reduce API calls - only 4 slots (2 hours)
        for (let i = 0; i < 4; i++) {
            const timeToCheckDate = new Date(startCheckTime.getTime() + i * 30 * 60 * 1000);
            
            const date = format(timeToCheckDate, 'yyyy-MM-dd');
            const time = format(timeToCheckDate, 'HH:mm:ss');
            
            const availableTables = await tableApi.getAvailableTables(locationId, date, time, partySize);
            
            if (availableTables.length > 0) {
                nextAvailableSlot = format(timeToCheckDate, 'p');
                break;
            }
        }

        return { availableNow: false, nextAvailableSlot };
    } catch (error) {
        errorTracker.captureError(
            error instanceof Error ? error : new Error('Failed to check availability'),
            'warning',
            { locationId, partySize }
        );
        return { availableNow: false, nextAvailableSlot: null };
    }
  },

  async getCuisineOptionsWithCache(): Promise<string[]> {
    const cacheKey = 'cuisines:all';
    
    try {
      return await restaurantCache.getOrSet(
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('restaurants')
            .select('cuisine')
            .not('cuisine', 'is', null);

          if (error) {
            throw error;
          }

          const cuisines = [...new Set(data?.map(r => r.cuisine).filter(Boolean))];
          return cuisines.sort();
        },
        30 * 60 * 1000, // 30 minutes TTL
        ['cuisines', 'metadata']
      );
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error('Failed to fetch cuisines'),
        'error'
      );
      return [];
    }
  },

  async getCityOptionsWithCache(): Promise<string[]> {
    // Since address is JSONB, we can't easily query distinct cities
    // Return empty array - would need a database function for this
    return [];
  },

  // Invalidate cache when restaurants are updated
  invalidateRestaurantCache(restaurantId?: string): void {
    if (restaurantId) {
      restaurantCache.clearByTag(`restaurant-${restaurantId}`);
    } else {
      restaurantCache.clearByTag('restaurants');
    }
    
    // Also clear metadata caches
    restaurantCache.clearByTag('metadata');
  },

  // Performance monitoring
  async getPerformanceMetrics(): Promise<{
    cacheStats: any;
    avgResponseTime: number;
    errorRate: number;
  }> {
    const cacheStats = restaurantCache.getStats();
    const errorStats = errorTracker.getErrorStats();
    
    return {
      cacheStats,
      avgResponseTime: 0, // Would be calculated from actual metrics
      errorRate: errorStats.errorsByLevel.error / errorStats.totalErrors || 0,
    };
  },

  // Bulk operations for admin use
  async bulkUpdateRestaurants(updates: Array<{ id: string; data: Partial<Restaurant> }>): Promise<void> {
    try {
      for (const update of updates) {
        await supabase
          .from('restaurants')
          .update(update.data)
          .eq('id', update.id);
        
        // Invalidate cache for this restaurant
        this.invalidateRestaurantCache(update.id);
      }
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error('Bulk update failed'),
        'error',
        { updateCount: updates.length }
      );
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    try {
      const start = performance.now();
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .limit(1);
      
      const responseTime = performance.now() - start;
      
      if (error) {
        return {
          status: 'unhealthy',
          details: { error: error.message, responseTime }
        };
      }
      
      const status = responseTime > 1000 ? 'degraded' : 'healthy';
      
      return {
        status,
        details: {
          responseTime,
          cacheStats: restaurantCache.getStats(),
          errorStats: errorTracker.getErrorStats()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
};
