import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ArrowLeft, Star, MapPin, Clock, DollarSign, Heart, HeartOff, X, Check, Users, Award, Search, Plus } from 'lucide-react';
import { restaurantSearchApi, ComparisonData, SearchFilters } from '@/api/restaurantSearch';
import { favoritesApi } from '@/api/favorites';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Restaurant } from '@/api/types';

import { RestaurantSelectorDialog } from '@/components/restaurants/RestaurantSelectorDialog';

interface RestaurantComparisonProps {
  restaurantIds?: string[];
  onClose?: () => void;
}

export default function RestaurantComparison({ restaurantIds: initialIds, onClose }: RestaurantComparisonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurantIds, setRestaurantIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleAddRestaurantToComparison = (restaurant: Restaurant) => {
    if (restaurantIds.includes(restaurant.id)) {
      toast.info('Restaurant already in comparison');
      return;
    }
    if (restaurantIds.length >= 4) {
      toast.error('Maximum 4 restaurants can be compared');
      return;
    }
    setRestaurantIds(prev => [...prev, restaurant.id]);
    setIsSelectorOpen(false);
  };

  // Initialize restaurant IDs from props or URL
  useEffect(() => {
    if (initialIds && initialIds.length > 0) {
      setRestaurantIds(initialIds);
    } else {
      const idsParam = searchParams.get('ids');
      if (idsParam) {
        const ids = idsParam.split(',').filter(id => id.length > 0);
        setRestaurantIds(ids);
      }
    }
  }, [initialIds, searchParams]);

  // Sync restaurant IDs to URL
  useEffect(() => {
    if (restaurantIds.length > 0) {
      const currentIds = searchParams.get('ids')?.split(',') || [];
      const newIds = restaurantIds.join(',');
      
      if (searchParams.get('ids') !== newIds) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('ids', newIds);
        navigate(`/restaurants/compare?${newSearchParams.toString()}`, { replace: true });
      }
    } else if (searchParams.has('ids')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('ids');
      navigate(`/restaurants/compare?${newSearchParams.toString()}`, { replace: true });
    }
  }, [restaurantIds, navigate, searchParams]);

  const loadComparisonDataCallback = useCallback(async () => {
    if (restaurantIds.length > 0) {
      setLoading(true);
      try {
        const data = await restaurantSearchApi.compareRestaurants(restaurantIds);
        setComparisonData(data);
      } catch (error) {
        console.error('Error loading comparison data:', error);
        toast.error('Failed to load restaurant comparison');
      } finally {
        setLoading(false);
      }
    }
  }, [restaurantIds]);

  // Load comparison data when restaurant IDs change
  useEffect(() => {
    loadComparisonDataCallback();
  }, [loadComparisonDataCallback]);

  // Load user favorites
  useEffect(() => {
    if (user) {
      loadUserFavorites();
    }
  }, [user]);

  const loadComparisonData = async () => {
    if (restaurantIds.length === 0) return;

    setLoading(true);
    try {
      const data = await restaurantSearchApi.compareRestaurants(restaurantIds);
      setComparisonData(data);
    } catch (error) {
      console.error('Error loading comparison data:', error);
      toast.error('Failed to load restaurant comparison');
    } finally {
      setLoading(false);
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

  const handleRemoveFromComparison = (restaurantId: string) => {
    const newIds = restaurantIds.filter(id => id !== restaurantId);
    setRestaurantIds(newIds);
    setComparisonData(prev => prev.filter(item => item.restaurant.id !== restaurantId));
    
    // Update URL immediately
    const newSearchParams = new URLSearchParams(searchParams);
    if (newIds.length > 0) {
      newSearchParams.set('ids', newIds.join(','));
    } else {
      newSearchParams.delete('ids');
    }
    navigate(`/restaurants/compare?${newSearchParams.toString()}`, { replace: true });
  };

  const handleAddRestaurant = () => {
    setIsSelectorOpen(true);
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderPriceDisplay = (price: string) => {
    const priceLabels = {
      '$': 'Budget-friendly',
      '$$': 'Moderate',
      '$$$': 'Upscale',
      '$$$$': 'Fine dining'
    };

    return (
      <div className="flex items-center gap-2">
        <span className="font-medium text-green-600">{price}</span>
        <span className="text-sm text-gray-600">
          {priceLabels[price as keyof typeof priceLabels] || price}
        </span>
      </div>
    );
  };

  if (restaurantIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Restaurants to Compare</h2>
            <p className="text-gray-600 mb-4">
              Add restaurants to your comparison to see them side-by-side.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleAddRestaurant}>
                Add Restaurants
              </Button>
              {onClose ? (
                <Button variant="outline" onClick={onClose}>
                  Go Back
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate('/restaurants')}>
                  Browse Restaurants
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <RestaurantSelectorDialog 
          open={isSelectorOpen} 
          onOpenChange={setIsSelectorOpen}
          onSelect={handleAddRestaurantToComparison}
          excludeIds={restaurantIds}
        />
      </div>
    );
  }

  if (loading && comparisonData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[500px] w-full" />
            <Skeleton className="h-[500px] w-full" />
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return ( 
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onClose ? onClose() : navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Comparison</h1>
              <p className="text-gray-600">Compare {comparisonData.length} restaurants side-by-side</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddRestaurant} disabled={restaurantIds.length >= 4}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </div>
        </div>

        <RestaurantSelectorDialog 
          open={isSelectorOpen} 
          onOpenChange={setIsSelectorOpen}
          onSelect={handleAddRestaurantToComparison}
          excludeIds={restaurantIds}
        />

        {/* Comparison Table */}
        <div className="overflow-x-auto pb-4">
          <div 
            className="grid gap-6 min-w-max" 
            style={{ 
              gridTemplateColumns: `repeat(${comparisonData.length}, minmax(320px, 1fr))` 
            }}
          >
            {comparisonData.map((item) => {
              const restaurant = item.restaurant;
              const location = restaurant.locations?.[0];

              return (
                <Card key={restaurant.id} className="relative">
                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                    onClick={() => handleRemoveFromComparison(restaurant.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <CardHeader className="pb-4">
                    <div className="aspect-video overflow-hidden rounded-lg mb-4">
                      <OptimizedImage
                        src={restaurant.image_url || "/placeholder.svg"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(restaurant.id)}
                          className={favorites.has(restaurant.id) ? 'text-red-500' : ''}
                        >
                          {favorites.has(restaurant.id) ? (
                            <Heart className="h-5 w-5 fill-current" />
                          ) : (
                            <Heart className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{restaurant.cuisine}</Badge>
                        {renderRatingStars(restaurant.rating || 0)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price & Features */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Price Range</span>
                        </div>
                        {renderPriceDisplay(restaurant.price)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <MapPin className="h-4 w-4" />
                          <span>Location</span>
                        </div>
                        <p className="text-sm">
                          {location ? `${location.city}, ${location.state}` : 'Location not available'}
                        </p>
                        {item.distance && (
                          <p className="text-xs text-gray-500">{item.distance.toFixed(1)} km away</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock className="h-4 w-4" />
                          <span>Features</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.features?.split(',').slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature.trim()}
                            </Badge>
                          )) || (
                            <span className="text-sm text-gray-500">No features listed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* User Reviews */}
                    {(item.userRating || item.userReview) && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Your Review</h4>
                        <div className="space-y-2">
                          {item.userRating && (
                            <div className="flex items-center gap-2">
                              {renderRatingStars(item.userRating)}
                              <span className="text-sm text-gray-600">Your rating</span>
                            </div>
                          )}
                          {item.userReview && (
                            <p className="text-sm text-gray-700 italic">"{item.userReview}"</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-4 border-t">
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/booking?restaurant=${restaurant.id}`)}
                      >
                        Make Reservation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Comparison Summary */}
        {comparisonData.length > 1 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Highest Rated</h4>
                  <p className="text-sm text-gray-600">
                    {comparisonData.reduce((best, current) =>
                      (current.restaurant.rating || 0) > (best.restaurant.rating || 0) ? current : best
                    ).restaurant.name}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Most Affordable</h4>
                  <p className="text-sm text-gray-600">
                    {comparisonData.reduce((best, current) => {
                      const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
                      const bestPrice = priceOrder[best.restaurant.price as keyof typeof priceOrder] || 5;
                      const currentPrice = priceOrder[current.restaurant.price as keyof typeof priceOrder] || 5;
                      return currentPrice < bestPrice ? current : best;
                    }).restaurant.name}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Closest</h4>
                  <p className="text-sm text-gray-600">
                    {comparisonData.reduce((best, current) => {
                      const bestDist = best.distance || Infinity;
                      const currentDist = current.distance || Infinity;
                      return currentDist < bestDist ? current : best;
                    }).restaurant.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
