import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Filter, Star, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Restaurant } from '@/api/types';

interface SearchFilters {
  query: string;
  cuisine: string[];
  priceRange: [number, number];
  rating: number;
  distance: number;
  features: string[];
  openNow: boolean;
  sortBy: 'relevance' | 'distance' | 'rating' | 'price';
}

interface AdvancedRestaurantSearchProps {
  restaurants: Restaurant[];
  onResults: (results: Restaurant[]) => void;
  onFiltersChange: (filters: SearchFilters) => void;
}

const cuisineOptions = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'French', 
  'Japanese', 'Thai', 'Mediterranean', 'Greek', 'Korean', 'Vietnamese'
];

const featureOptions = [
  'Outdoor Seating', 'Private Dining', 'Vegan Options', 'Gluten-Free',
  'Wi-Fi', 'Parking', 'Live Music', 'Pet Friendly', 'Delivery', 'Takeout'
];

export function AdvancedRestaurantSearch({
  restaurants,
  onResults,
  onFiltersChange,
}: AdvancedRestaurantSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    cuisine: [],
    priceRange: [1, 4],
    rating: 0,
    distance: 25,
    features: [],
    openNow: false,
    sortBy: 'relevance',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const { latitude, longitude, requestLocation, calculateDistance } = useGeolocation();

  const filteredRestaurants = useMemo(() => {
    const results = restaurants.filter(restaurant => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesName = restaurant.name.toLowerCase().includes(query);
        const matchesCuisine = restaurant.cuisine?.toLowerCase().includes(query);
        const matchesDescription = restaurant.description?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesCuisine && !matchesDescription) {
          return false;
        }
      }

      // Cuisine filter
      if (filters.cuisine.length > 0) {
        if (!restaurant.cuisine || !filters.cuisine.includes(restaurant.cuisine)) {
          return false;
        }
      }

      // Price range filter
      if (restaurant.price) {
        const priceLevel = restaurant.price.length; // $ = 1, $$ = 2, $$$ = 3, $$$$ = 4
        if (priceLevel < filters.priceRange[0] || priceLevel > filters.priceRange[1]) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating > 0) {
        if (!restaurant.rating || restaurant.rating < filters.rating) {
          return false;
        }
      }

      // Distance filter
      if (latitude && longitude && restaurant.locations?.[0]) {
        // For demo purposes, generate random coordinates near user
        const restaurantLat = latitude + (Math.random() - 0.5) * 0.1;
        const restaurantLon = longitude + (Math.random() - 0.5) * 0.1;
        const distance = calculateDistance(restaurantLat, restaurantLon);
        
        if (distance && distance > filters.distance) {
          return false;
        }
      }

      // Features filter
      if (filters.features.length > 0) {
        const restaurantFeatures = typeof restaurant.features === 'string' 
          ? restaurant.features 
          : '';
        
        const hasAllFeatures = filters.features.every(feature =>
          restaurantFeatures.toLowerCase().includes(feature.toLowerCase())
        );
        
        if (!hasAllFeatures) {
          return false;
        }
      }

      return true;
    });

    // Sort results
    switch (filters.sortBy) {
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price':
        results.sort((a, b) => (a.price?.length || 0) - (b.price?.length || 0));
        break;
      case 'distance':
        if (latitude && longitude) {
          results.sort((a, b) => {
            const distanceA = calculateDistance(latitude + Math.random() * 0.1, longitude + Math.random() * 0.1) || 0;
            const distanceB = calculateDistance(latitude + Math.random() * 0.1, longitude + Math.random() * 0.1) || 0;
            return distanceA - distanceB;
          });
        }
        break;
      default:
        // Relevance - keep original order or implement relevance scoring
        break;
    }

    return results;
  }, [restaurants, filters, latitude, longitude, calculateDistance]);

  useEffect(() => {
    onResults(filteredRestaurants);
    onFiltersChange(filters);
  }, [filteredRestaurants, filters, onResults, onFiltersChange]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      cuisine: [],
      priceRange: [1, 4],
      rating: 0,
      distance: 25,
      features: [],
      openNow: false,
      sortBy: 'relevance',
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Basic Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants, cuisine, or location..."
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={requestLocation}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Near Me
            </Button>
          </div>

          {/* Active Filters */}
          {(filters.cuisine.length > 0 || filters.features.length > 0 || filters.rating > 0) && (
            <div className="flex flex-wrap gap-2">
              {filters.cuisine.map(cuisine => (
                <Badge
                  key={cuisine}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => updateFilters({
                    cuisine: filters.cuisine.filter(c => c !== cuisine)
                  })}
                >
                  {cuisine} ×
                </Badge>
              ))}
              {filters.features.map(feature => (
                <Badge
                  key={feature}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => updateFilters({
                    features: filters.features.filter(f => f !== feature)
                  })}
                >
                  {feature} ×
                </Badge>
              ))}
              {filters.rating > 0 && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => updateFilters({ rating: 0 })}
                >
                  {filters.rating}+ stars ×
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              {/* Cuisine */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cuisine</label>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {cuisineOptions.map(cuisine => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine}
                        checked={filters.cuisine.includes(cuisine)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilters({ cuisine: [...filters.cuisine, cuisine] });
                          } else {
                            updateFilters({
                              cuisine: filters.cuisine.filter(c => c !== cuisine)
                            });
                          }
                        }}
                      />
                      <label htmlFor={cuisine} className="text-xs cursor-pointer">
                        {cuisine}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Price Range
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  max={4}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{'$'.repeat(filters.priceRange[0])}</span>
                  <span>{'$'.repeat(filters.priceRange[1])}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Minimum Rating
                </label>
                <Select
                  value={filters.rating.toString()}
                  onValueChange={(value) => updateFilters({ rating: parseFloat(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Distance ({filters.distance} km)
                </label>
                <Slider
                  value={[filters.distance]}
                  onValueChange={(value) => updateFilters({ distance: value[0] })}
                  max={50}
                  min={1}
                  step={1}
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilters({ sortBy: value as SearchFilters['sortBy'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Features */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium">Features</label>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {featureOptions.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={filters.features.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilters({ features: [...filters.features, feature] });
                          } else {
                            updateFilters({
                              features: filters.features.filter(f => f !== feature)
                            });
                          }
                        }}
                      />
                      <label htmlFor={feature} className="text-xs cursor-pointer">
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
