
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, RestaurantLocation } from '@/api/types';
import { errorTracker } from '@/utils/error-tracking';

export interface RestaurantFilters {
  search?: string;
  cuisine?: string[];
  minRating?: number;
  priceRange?: string[];
  city?: string;
  state?: string;
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'newest';
  favoritesOnly?: boolean;
  favoriteIds?: string[];
}

export interface PaginatedRestaurantsResponse {
  restaurants: Restaurant[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}

export const enhancedRestaurantApi = {
  async getPaginated(
    page: number = 1,
    limit: number = 12,
    filters: RestaurantFilters = {}
  ): Promise<PaginatedRestaurantsResponse> {
    // restaurant_locations uses JSONB for address, not individual columns
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        locations:restaurant_locations!restaurant_locations_restaurant_id_fkey (
          id,
          restaurant_id,
          address,
          contact_info,
          coordinates,
          is_primary,
          timezone,
          created_at
        )
      `, { count: 'exact' });

    // Apply filters
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

    // Note: city/state filters won't work directly since address is JSONB
    // Would need a database function or client-side filtering

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

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
      errorTracker.captureError(error, 'error', {
        context: 'get_paginated_restaurants',
        page,
        limit,
        filters
      });
      throw error;
    }

    // Transform the data to ensure correct typing
    const transformedData: Restaurant[] = (data || []).map((item: any) => ({
      ...item,
      locations: Array.isArray(item.locations) 
        ? item.locations.map((loc: any) => {
            // Parse JSONB address if it's an object
            const addressObj = typeof loc.address === 'object' ? loc.address : {};
            const contactObj = typeof loc.contact_info === 'object' ? loc.contact_info : {};
            return {
              id: loc.id,
              restaurant_id: loc.restaurant_id,
              address: addressObj.street || '',
              city: addressObj.city || '',
              state: addressObj.state || '',
              zip: addressObj.zip || '',
              phone_number: contactObj.phone_number || contactObj.phone || '',
              email: contactObj.email || '',
              created_at: loc.created_at,
              updated_at: loc.created_at,
            } as RestaurantLocation;
          })
        : []
    }));

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;

    return {
      restaurants: transformedData,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage
    };
  },

  async searchWithAutocomplete(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
      .from('restaurants')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) {
      errorTracker.captureError(error, 'error', {
        context: 'search_autocomplete',
        query
      });
      return [];
    }

    return data?.map(r => r.name) || [];
  },

  async getCuisineOptions(): Promise<string[]> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('cuisine')
      .not('cuisine', 'is', null);

    if (error) {
      errorTracker.captureError(error, 'error', {
        context: 'get_cuisine_options'
      });
      return [];
    }

    const cuisines = [...new Set(data?.map(r => r.cuisine).filter(Boolean))];
    return cuisines.sort();
  },

  async getCityOptions(): Promise<string[]> {
    // Since address is JSONB, we can't easily query distinct cities
    // Return empty array - would need a database function for this
    return [];
  }
};
