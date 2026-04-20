import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Clock, Users, Heart, HeartOff, TrendingUp, Filter } from 'lucide-react';
import { restaurantSearchApi, SearchFilters, SearchResult } from '@/api/restaurantSearch';
import { favoritesApi } from '@/api/favorites';
import { AdvancedSearch } from '@/components/restaurants/AdvancedSearch';
import { RestaurantCard } from '@/components/RestaurantCard';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export default function EnhancedRestaurants() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [trending, setTrending] = useState<any[]>([]);
  const [nearby, setNearby] = useState<any[]>([]);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    limit: 20,
    sortBy: 'rating'
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load user favorites
  useEffect(() => {
    if (user) {
      loadUserFavorites();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      const [trendingData, nearbyData] = await Promise.all([
        restaurantSearchApi.getTrending(6),
        restaurantSearchApi.getNearby(0, 0, 10, 6) // Will use user's location if available
      ]);

      setTrending(trendingData);
      setNearby(nearbyData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadUserFavorites = async () => {
    try {
      const userFavorites = await favoritesApi.getUserFavorites();
      setFavorites(new Set(userFavorites.map(f => f.restaurant_id)));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setLoading(true);
    try {
      const results = await restaurantSearchApi.search(filters);
      setSearchResults(results);
      setCurrentFilters(filters);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (restaurantId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      const result = await favoritesApi.toggle(restaurantId);
      if (result.success) {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (result.isFavorite) {
            newFavorites.add(restaurantId);
          } else {
            newFavorites.delete(restaurantId);
          }
          return newFavorites;
        });
        toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleCompare = (restaurantIds: string[]) => {
    if (restaurantIds.length === 0) return;
    
    if (restaurantIds.length > 4) {
      toast.error('Maximum 4 restaurants can be compared');
      return;
    }

    navigate(`/restaurants/compare?ids=${restaurantIds.join(',')}`);
  };

  const handleRestaurantClick = (restaurant: any) => {
    const identifier = restaurant.slug || restaurant.id;
    navigate(`/restaurants/${identifier}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Restaurants</h1>
          <p className="text-gray-600">Find your perfect dining experience with advanced search and filters</p>
        </div>

        {/* Advanced Search */}
        <div className="mb-8">
          <AdvancedSearch
            onSearch={handleSearch}
            onFiltersChange={setCurrentFilters}
            initialFilters={currentFilters}
          />
        </div>

        {/* Search Results or Default Content */}
        {searchResults ? (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Results ({searchResults.total})
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {searchResults.filters.availableCuisines.length} cuisines •
                  {searchResults.filters.availablePriceRanges.length} price ranges •
                  {searchResults.filters.availableFeatures.length} features
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-48 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isFavorite={favorites.has(restaurant.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onCompare={handleCompare}
                    showCompare={true}
                    onClick={() => handleRestaurantClick(restaurant)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Trending Restaurants */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Trending Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isFavorite={favorites.has(restaurant.id)}
                    onToggleFavorite={handleToggleFavorite}
                    showCompare={true}
                    onClick={() => handleRestaurantClick(restaurant)}
                  />
                ))}
              </div>
            </section>

            {/* Nearby Restaurants */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Nearby Restaurants</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearby.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isFavorite={favorites.has(restaurant.id)}
                    onToggleFavorite={handleToggleFavorite}
                    showCompare={true}
                    onClick={() => handleRestaurantClick(restaurant)}
                  />
                ))}
              </div>
            </section>

            {/* Search Tips */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Search Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Filter by Cuisine</h4>
                      <p className="text-sm text-gray-600">
                        Find restaurants serving Italian, Chinese, Mexican, or any cuisine you love.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Price Range</h4>
                      <p className="text-sm text-gray-600">
                        From budget-friendly ($) to fine dining ($$$$) - find what fits your budget.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Ratings & Reviews</h4>
                      <p className="text-sm text-gray-600">
                        See highly-rated restaurants and read authentic customer reviews.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Features & Amenities</h4>
                      <p className="text-sm text-gray-600">
                        WiFi, outdoor seating, parking, and more - find restaurants with what you need.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
