
import { RestaurantFilters } from "@/api/restaurant/enhanced";
import { RestaurantList } from "@/components/restaurants/RestaurantList";
import { RestaurantsMap } from "@/components/maps/RestaurantsMap";
import { EnhancedLoadingSpinner } from "@/components/ui/enhanced-loading-spinner";
import { CustomPagination } from "@/components/ui/pagination";
import { Restaurant } from "@/api/types";

interface RestaurantsContentProps {
  viewMode: 'grid' | 'list' | 'map';
  restaurants: Restaurant[];
  isLoading: boolean;
  isFetching: boolean;
  useInfiniteScrollMode: boolean;
  hasNextPage: boolean;
  currentPage: number;
  totalPages: number;
  onRestaurantClick: (restaurant: Restaurant) => void;
  onPageChange: (page: number) => void;
  clearFilters: () => void;
}

export function RestaurantsContent({
  viewMode,
  restaurants,
  isLoading,
  isFetching,
  useInfiniteScrollMode,
  hasNextPage,
  currentPage,
  totalPages,
  onRestaurantClick,
  onPageChange,
  clearFilters
}: RestaurantsContentProps) {
  if (viewMode === 'map') {
    return (
      <div className="space-y-4">
        <RestaurantsMap 
          restaurants={restaurants}
          onRestaurantClick={onRestaurantClick}
          height="600px"
        />
      </div>
    );
  }

  return (
    <>
      <RestaurantList 
        isLoading={isLoading}
        restaurants={restaurants}
        clearFilters={clearFilters}
        viewMode={viewMode as 'grid' | 'list'}
        onRestaurantClick={onRestaurantClick}
      />

      {!useInfiniteScrollMode && totalPages > 1 && (
        <nav aria-label="Restaurant pages navigation" className="mt-8">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="mt-8"
          />
        </nav>
      )}

      {useInfiniteScrollMode && isFetching && (
        <div className="flex justify-center py-8" role="status" aria-label="Loading more restaurants">
          <EnhancedLoadingSpinner 
            text="Loading more restaurants..." 
            variant="default"
          />
        </div>
      )}

      {useInfiniteScrollMode && !hasNextPage && restaurants.length > 0 && (
        <div className="text-center py-8 text-muted-foreground" role="status">
          You've reached the end of the results
        </div>
      )}
    </>
  );
}
