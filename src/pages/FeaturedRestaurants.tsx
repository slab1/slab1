
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import restaurantApi from "@/api/restaurant";
import { RestaurantCard } from "@/components/RestaurantCard";
import { EnhancedLoadingSpinner } from "@/components/ui/enhanced-loading-spinner";
import { ErrorDisplay } from "@/components/restaurants/ErrorDisplay";
import { testDatabaseConnection } from "@/integrations/supabase/client";

export default function FeaturedRestaurants() {
  const navigate = useNavigate();

  const {
    data: restaurants,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["featured-restaurants"],
    queryFn: async () => {
      // Test connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        throw new Error("DATABASE_CONNECTION_FAILED");
      }

      const allRestaurants = await restaurantApi.getAll();
      // Filter for featured restaurants (rating >= 4.0 or highly rated)
      return allRestaurants.filter(restaurant => 
        restaurant && (restaurant.rating >= 4.0 || !restaurant.rating)
      ).slice(0, 12); // Show top 12 featured restaurants
    },
    retry: (failureCount, error) => {
      // Don't retry database connection errors
      if (error?.message === "DATABASE_CONNECTION_FAILED") {
        return false;
      }
      return failureCount < 2;
    }
  });

  const handleRestaurantClick = (restaurant: any) => {
    const identifier = restaurant.slug || restaurant.id;
    navigate(`/booking/${identifier}`);
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <EnhancedLoadingSpinner 
            size="lg" 
            text="Loading featured restaurants..." 
            variant="default"
          />
        </div>
      </main>
    );
  }

  if (error) {
    const isConnectionError = error instanceof Error && error.message === "DATABASE_CONNECTION_FAILED";
    
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <ErrorDisplay 
            message={isConnectionError ? 
              "Unable to connect to restaurant database" : 
              (error instanceof Error ? error.message : "Unable to load featured restaurants")
            }
            isConnectionError={isConnectionError}
            onRetry={handleRetry}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="bg-muted/30 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Featured Restaurants
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Discover our handpicked selection of exceptional dining experiences
            </p>
          </div>

          {restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id}
                  restaurant={restaurant} 
                  viewMode="grid"
                  featured={true}
                  onClick={() => handleRestaurantClick(restaurant)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No featured restaurants found</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for our featured restaurant selections.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
