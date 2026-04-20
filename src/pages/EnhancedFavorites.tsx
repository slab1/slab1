import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Grid, List, Filter, SortAsc, MapPin, Star, Clock, Trash2, Share2 } from 'lucide-react';
import { favoritesApi, Favorite } from '@/api/favorites';
import { restaurantSearchApi } from '@/api/restaurantSearch';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

type ViewMode = 'grid' | 'list';
type SortBy = 'date_added' | 'rating' | 'distance' | 'name' | 'cuisine';

export default function EnhancedFavorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date_added');
  const [filterCuisine, setFilterCuisine] = useState<string>('all');
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);

  // Load favorites on mount and when user changes
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  // Extract available cuisines when favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      const cuisines = [...new Set(favorites.map(f => f.restaurant?.cuisine).filter(Boolean))];
      setAvailableCuisines(cuisines as string[]);
    }
  }, [favorites]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const userFavorites = await favoritesApi.getUserFavorites();
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId: string) => {
    try {
      const result = await favoritesApi.toggle(restaurantId);
      if (!result.isFavorite) {
        setFavorites(prev => prev.filter(f => f.restaurant_id !== restaurantId));
        toast.success('Removed from favorites');
      }
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const handleBulkRemove = async (restaurantIds: string[]) => {
    try {
      const promises = restaurantIds.map(id => favoritesApi.remove(id));
      await Promise.all(promises);
      setFavorites(prev => prev.filter(f => !restaurantIds.includes(f.restaurant_id)));
      toast.success(`Removed ${restaurantIds.length} restaurants from favorites`);
    } catch (error) {
      toast.error('Failed to remove some favorites');
      loadFavorites(); // Refresh to show current state
    }
  };

  const handleShareFavorites = async () => {
    const favoriteNames = favorites.map(f => f.restaurant?.name).filter(Boolean);
    const shareText = `Check out my favorite restaurants: ${favoriteNames.join(', ')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Favorite Restaurants',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Favorites list copied to clipboard');
      });
    }
  };

  // Filter and sort favorites
  const filteredAndSortedFavorites = React.useMemo(() => {
    let filtered = favorites;

    // Filter by cuisine
    if (filterCuisine !== 'all') {
      filtered = filtered.filter(f => f.restaurant?.cuisine === filterCuisine);
    }

    // Sort favorites
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date_added':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating':
          return (b.restaurant?.rating || 0) - (a.restaurant?.rating || 0);
        case 'name':
          return (a.restaurant?.name || '').localeCompare(b.restaurant?.name || '');
        case 'cuisine':
          return (a.restaurant?.cuisine || '').localeCompare(b.restaurant?.cuisine || '');
        case 'distance':
          // This would require location data - for now, sort by name
          return (a.restaurant?.name || '').localeCompare(b.restaurant?.name || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [favorites, filterCuisine, sortBy]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In to View Favorites</h2>
            <p className="text-gray-600 mb-4">
              Save your favorite restaurants and access them anytime.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-current" />
                My Favorites
              </h1>
              <p className="text-gray-600 mt-2">
                {favorites.length} favorite {favorites.length === 1 ? 'restaurant' : 'restaurants'}
              </p>
            </div>

            {favorites.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleShareFavorites}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
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
          </div>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start exploring restaurants and save your favorites for quick access later.
              </p>
              <Button onClick={() => window.location.href = '/restaurants'}>
                Discover Restaurants
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>

                <Select value={filterCuisine} onValueChange={setFilterCuisine}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cuisines</SelectItem>
                    {availableCuisines.map(cuisine => (
                      <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Sort:</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_added">Recently Added</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="cuisine">Cuisine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Favorites Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">{favorites.length}</div>
                  <p className="text-sm text-gray-600">Total Favorites</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {(favorites.reduce((sum, f) => sum + (f.restaurant?.rating || 0), 0) / favorites.length).toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{availableCuisines.length}</div>
                  <p className="text-sm text-gray-600">Cuisines</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {favorites.filter(f => f.restaurant?.price === '$').length}
                  </div>
                  <p className="text-sm text-gray-600">Budget Friendly</p>
                </CardContent>
              </Card>
            </div>

            {/* Favorites Grid/List */}
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {filteredAndSortedFavorites.map((favorite) => (
                <div key={favorite.id} className="relative group">
                  <RestaurantCard
                    restaurant={favorite.restaurant!}
                    viewMode={viewMode}
                    onClick={() => {
                      const identifier = favorite.restaurant?.slug || favorite.restaurant_id;
                      navigate(`/restaurants/${identifier}`);
                    }}
                  />

                  {/* Favorite metadata overlay */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Added {new Date(favorite.created_at).toLocaleDateString()}
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-12 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.restaurant_id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Bulk Actions */}
            {filteredAndSortedFavorites.length > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {filteredAndSortedFavorites.length} restaurants shown
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const restaurantIds = filteredAndSortedFavorites.map(f => f.restaurant_id);
                          handleBulkRemove(restaurantIds);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
