
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import restaurantApi from "@/api/restaurant";
import { RestaurantCard } from "@/components/RestaurantCard";
import { EnhancedLoadingSpinner } from "@/components/ui/enhanced-loading-spinner";
import { ErrorDisplay } from "@/components/restaurants/ErrorDisplay";
import { Button } from "@/components/ui/button";
import { MapPin, Map as MapIcon, List } from "lucide-react";
import { testDatabaseConnection } from "@/integrations/supabase/client";
import { RestaurantsMap } from "@/components/maps/RestaurantsMap";

export default function NearbyRestaurants() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError("Unable to get your location. Showing all restaurants instead.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser. Showing all restaurants instead.");
    }
  }, []);

  const {
    data: restaurants,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["nearby-restaurants", userLocation],
    queryFn: async () => {
      // Test connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        throw new Error("DATABASE_CONNECTION_FAILED");
      }

      const allRestaurants = await restaurantApi.getAll();
      // For now, return all restaurants since we don't have lat/lng in the database
      // In a real app, you'd filter by distance using the user's location
      return allRestaurants.filter(restaurant => restaurant && restaurant.locations?.length > 0);
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

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError("Unable to get your location. Please enable location access.");
        }
      );
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <EnhancedLoadingSpinner 
            size="lg" 
            text="Finding nearby restaurants..." 
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
              (error instanceof Error ? error.message : "Unable to load nearby restaurants")
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
              Nearby Restaurants
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Discover great dining options near you
            </p>
            
            {locationError && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm mb-2">{locationError}</p>
                <Button 
                  onClick={requestLocation}
                  variant="outline"
                  size="sm"
                  className="text-yellow-800 border-yellow-300"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Enable Location
                </Button>
              </div>
            )}
            
            {userLocation && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location detected - showing restaurants near you
                </p>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <List className="h-4 w-4 mr-2" />
                  Grid View
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  className="rounded-l-none"
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map View
                </Button>
              </div>
            </div>
          </div>

          {restaurants && restaurants.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard 
                    key={restaurant.id}
                    restaurant={restaurant} 
                    viewMode="grid"
                    onClick={() => handleRestaurantClick(restaurant)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden h-[600px]">
                <RestaurantsMap 
                  restaurants={restaurants} 
                  onRestaurantClick={handleRestaurantClick}
                  height="100%"
                  userLocation={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
                />
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any restaurants in your area. Try expanding your search.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
