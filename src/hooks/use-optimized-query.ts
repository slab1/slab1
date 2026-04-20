import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { AdvancedCacheManager } from '@/utils/advanced-cache-manager';
import { ErrorHandler } from '@/utils/error-handling';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  cacheManager?: AdvancedCacheManager<T>;
  enableBackground?: boolean;
  dedupe?: boolean;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  cacheManager,
  enableBackground = true,
  dedupe = true,
  ...options
}: OptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();
  const requestCache = useRef(new Map<string, Promise<T>>());
  const cacheKey = queryKey.join(':');

  // Enhanced query function with deduplication and caching
  const enhancedQueryFn = useCallback(async (): Promise<T> => {
    try {
      // Check cache manager first
      if (cacheManager) {
        const cached = cacheManager.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Deduplicate identical requests
      if (dedupe && requestCache.current.has(cacheKey)) {
        return requestCache.current.get(cacheKey)!;
      }

      // Create new request
      const request = queryFn().then(data => {
        // Store in cache manager
        if (cacheManager) {
          cacheManager.set(cacheKey, data);
        }
        
        // Clean up request cache
        requestCache.current.delete(cacheKey);
        
        return data;
      }).catch(error => {
        // Clean up request cache on error
        requestCache.current.delete(cacheKey);
        throw error;
      });

      if (dedupe) {
        requestCache.current.set(cacheKey, request);
      }

      return request;
    } catch (error) {
      throw ErrorHandler.handle(error, { 
        context: 'useOptimizedQuery', 
        queryKey: cacheKey 
      });
    }
  }, [queryFn, cacheKey, cacheManager, dedupe]);

  // Background refetch functionality
  useEffect(() => {
    if (!enableBackground) return;

    const backgroundRefetch = () => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn: enhancedQueryFn,
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    };

    // Refetch on window focus
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        backgroundRefetch();
      }
    };

    // Refetch on network reconnect
    const handleOnline = () => {
      backgroundRefetch();
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient, queryKey, enhancedQueryFn, enableBackground]);

  return useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Smart retry logic
      if (failureCount >= 3) return false;
      
      // Don't retry on 4xx errors except 429 (rate limit)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500 && status !== 429) {
          return false;
        }
      }
      
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}

// Specialized hooks for common patterns
export function useRestaurantQuery(restaurantId: string, options?: Partial<OptimizedQueryOptions<any>>) {
  return useOptimizedQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_locations (*)
        `)
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes for restaurant data
    ...options,
  });
}

export function useReservationsQuery(userId?: string, options?: Partial<OptimizedQueryOptions<any>>) {
  return useOptimizedQuery({
    queryKey: ['reservations', userId || 'all'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      let query = supabase
        .from('reservations')
        .select(`
          *,
          restaurant_locations (
            *,
            restaurants (name, cuisine)
          )
        `)
        .order('reservation_date', { ascending: false });

      if (userId) {
        query = (query as any).eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds for reservations
    ...options,
  });
}