
import { Restaurant } from "@/api/types";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantCard } from "@/components/RestaurantCard";
import { cn } from "@/lib/utils";

interface RestaurantListProps {
  isLoading: boolean;
  restaurants: Restaurant[];
  clearFilters: () => void;
  viewMode?: 'grid' | 'list';
  onRestaurantClick?: (restaurant: Restaurant) => void;
}

export function RestaurantList({
  isLoading,
  restaurants,
  clearFilters,
  viewMode = 'grid',
  onRestaurantClick
}: RestaurantListProps) {
  if (isLoading) {
    return (
      <div 
        className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}
        role="status"
        aria-label="Loading restaurants"
      >
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-card rounded-xl overflow-hidden shadow-sm",
              viewMode === 'list' && "flex gap-4 p-4"
            )}
          >
            <Skeleton className={cn(
              viewMode === 'grid' ? "h-48 w-full" : "h-32 w-48 flex-shrink-0"
            )} />
            <div className={cn(
              viewMode === 'grid' ? "p-5 space-y-3" : "flex-1 space-y-2"
            )}>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12" role="status">
        <div className="bg-muted inline-flex rounded-full p-6 mb-4">
          <Search className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find any restaurants matching your search criteria.
        </p>
        <Button onClick={clearFilters}>Clear Filters</Button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}
      role="region"
      aria-label={`Restaurant results in ${viewMode} view`}
    >
      {restaurants.map((restaurant) => (
        restaurant ? (
          <RestaurantCard 
            key={restaurant.id}
            restaurant={restaurant} 
            viewMode={viewMode}
            onClick={() => onRestaurantClick?.(restaurant)}
          />
        ) : null
      ))}
    </div>
  );
}
