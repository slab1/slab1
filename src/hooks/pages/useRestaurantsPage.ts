
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { optimizedRestaurantApi } from "@/api/restaurant/optimized";
import { RestaurantFilters } from "@/api/restaurant/enhanced";
import { usePagination } from "@/hooks/use-pagination";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useScreenReader } from "@/hooks/use-screen-reader";
import { performanceUtils } from "@/utils/performance";
import { useAuth } from "@/hooks/use-auth";
import { useFavoriteIds } from "@/hooks/useFavoriteIds";
import { useIsMobile } from "@/hooks/use-mobile";

const ITEMS_PER_PAGE = 12;

export function useRestaurantsPage() {
  const navigate = useNavigate();
  const { announce, ScreenReaderAnnouncer } = useScreenReader();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<RestaurantFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [useInfiniteScrollMode, setUseInfiniteScrollMode] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  const { favoriteIds, isLoading: isLoadingFavorites } = useFavoriteIds();

  const {
    currentPage,
    goToPage,
    goToNextPage,
  } = usePagination({
    totalItems: 0, // Placeholder
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const apiFilters: RestaurantFilters = {
    ...filters,
    ...(filters.favoritesOnly && user ? { favoriteIds } : {}),
  };
  
  const {
    data: restaurantData,
    isLoading,
    error,
    refetch
  } = useQuery({
    enabled: !(filters.favoritesOnly && user && isLoadingFavorites),
    // Serialize object filters to ensure stable query keys for proper caching
    queryKey: ["restaurants-optimized", JSON.stringify(apiFilters), currentPage],
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[Restaurants] Fetching restaurants with filters:', apiFilters);
      }
      try {
        const result = await optimizedRestaurantApi.fetchRestaurantsFromDB(currentPage, ITEMS_PER_PAGE, apiFilters);
        return result;
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[Restaurants] Fetch error:', err);
        }
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    totalPages,
    hasNextPage,
  } = usePagination({
    totalItems: restaurantData?.totalCount || 0,
    itemsPerPage: ITEMS_PER_PAGE,
    initialPage: currentPage,
  });

  const { isFetching } = useInfiniteScroll({
    hasNextPage: hasNextPage && useInfiniteScrollMode,
    fetchNextPage: goToNextPage,
    isLoading,
  });

  const debouncedFilterChange = performanceUtils.debounce((newFilters: RestaurantFilters) => {
    setFilters(newFilters);
    goToPage(1);
    announce("Filters updated, searching for restaurants");
  }, 300);

  const handleFiltersChange = (newFilters: RestaurantFilters) => {
    debouncedFilterChange(newFilters);
    if (isMobile) {
      setIsFilterSheetOpen(false);
    }
  };

  const handleViewModeChange = (mode: 'grid' | 'list' | 'map') => {
    setViewMode(mode);
    announce(`View changed to ${mode} layout`);
  };

  const handleRestaurantClick = (restaurant: any) => {
    const identifier = restaurant.slug || restaurant.id;
    navigate(`/booking/${identifier}`);
    announce(`Navigating to book at ${restaurant.name}`);
  };

  const clearFilters = () => {
    setFilters({});
    goToPage(1);
    announce("Filters cleared");
    if (isMobile) {
      setIsFilterSheetOpen(false);
    }
  };

  const handleRetry = () => {
    refetch();
    announce("Retrying to load restaurants");
  };

  useEffect(() => {
    if (restaurantData?.totalCount !== undefined) {
      announce(`${restaurantData.totalCount} restaurants found`);
    }
  }, [restaurantData?.totalCount, announce]);

  const isContentLoading = isLoading || (filters.favoritesOnly && user && isLoadingFavorites);

  return {
    isMobile,
    filters,
    viewMode,
    useInfiniteScrollMode,
    isFilterSheetOpen,
    restaurantData,
    isLoading: isContentLoading,
    error,
    isFetching,
    hasNextPage,
    currentPage,
    totalPages,
    handleFiltersChange,
    handleViewModeChange,
    handleRestaurantClick,
    clearFilters,
    handleRetry,
    setUseInfiniteScrollMode,
    setIsFilterSheetOpen,
    goToPage,
    announce,
    ScreenReaderAnnouncer,
    isLoadingFavorites,
  };
}
