import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Star, DollarSign, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { restaurantSearchApi, SearchFilters } from '@/api/restaurantSearch';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  showMap?: boolean;
}

export function AdvancedSearch({ onSearch, onFiltersChange, initialFilters = {}, showMap = false }: AdvancedSearchProps) {
  const [query, setQuery] = useState(initialFilters.query || '');
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters.query || '',
    cuisine: initialFilters.cuisine || [],
    priceRange: initialFilters.priceRange || [],
    rating: initialFilters.rating || 0,
    location: initialFilters.location || '',
    features: initialFilters.features || [],
    sortBy: initialFilters.sortBy || 'rating',
    sortOrder: initialFilters.sortOrder || 'desc',
    limit: initialFilters.limit || 20,
    ...initialFilters
  });

  const [availableFilters, setAvailableFilters] = useState({
    availableCuisines: [] as string[],
    availablePriceRanges: [] as string[],
    availableFeatures: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const debouncedQuery = useDebounce(query, 500);

  const handleSearch = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    try {
      const results = await restaurantSearchApi.search(searchFilters);
      onSearch(searchFilters);
      onFiltersChange?.(searchFilters);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, onFiltersChange]);

  // Load available filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== filters.query) {
      handleSearch({ ...filters, query: debouncedQuery });
    }
  }, [debouncedQuery, filters, handleSearch]);

  const loadFilterOptions = async () => {
    try {
      const { availableCuisines, availablePriceRanges, availableFeatures } =
        await restaurantSearchApi.getAvailableFilters();
      setAvailableFilters({
        availableCuisines,
        availablePriceRanges,
        availableFeatures
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    handleSearch(newFilters);
  };

  const toggleArrayFilter = (filterType: keyof SearchFilters, value: string) => {
    const currentArray = (filters[filterType] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    updateFilters({ [filterType]: newArray });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: filters.query, // Keep search query
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      limit: filters.limit
    };
    setFilters(clearedFilters);
    handleSearch(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.cuisine?.length) count++;
    if (filters.priceRange?.length) count++;
    if (filters.rating && filters.rating > 0) count++;
    if (filters.location) count++;
    if (filters.features?.length) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search restaurants, cuisine, location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-24"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96">
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Cuisine Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Cuisine</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableFilters.availableCuisines.map((cuisine) => (
                      <div key={cuisine} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cuisine-${cuisine}`}
                          checked={filters.cuisine?.includes(cuisine) || false}
                          onCheckedChange={() => toggleArrayFilter('cuisine', cuisine)}
                        />
                        <Label htmlFor={`cuisine-${cuisine}`} className="text-sm">
                          {cuisine}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Price Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableFilters.availablePriceRanges.map((price) => (
                      <div key={price} className="flex items-center space-x-2">
                        <Checkbox
                          id={`price-${price}`}
                          checked={filters.priceRange?.includes(price) || false}
                          onCheckedChange={() => toggleArrayFilter('priceRange', price)}
                        />
                        <Label htmlFor={`price-${price}`} className="text-sm flex items-center">
                          <span className="text-green-600 mr-1">{price}</span>
                          {price === '$' && 'Budget-friendly'}
                          {price === '$$' && 'Moderate'}
                          {price === '$$$' && 'Upscale'}
                          {price === '$$$$' && 'Fine dining'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Minimum Rating</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.rating || 0]}
                      onValueChange={([value]) => updateFilters({ rating: value })}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Any</span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {filters.rating || 0}+
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="City, state, or zip"
                      value={filters.location || ''}
                      onChange={(e) => updateFilters({ location: e.target.value })}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Features Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Features & Amenities</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {availableFilters.availableFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={filters.features?.includes(feature) || false}
                          onCheckedChange={() => toggleArrayFilter('features', feature)}
                        />
                        <Label htmlFor={`feature-${feature}`} className="text-sm">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => updateFilters({ sortBy: value as SearchFilters['sortBy'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price">Price (Low to High)</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters ({activeFilterCount})
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Button onClick={() => handleSearch(filters)} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.cuisine?.map((cuisine) => (
            <Badge key={cuisine} variant="secondary" className="flex items-center gap-1">
              {cuisine}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter('cuisine', cuisine)}
              />
            </Badge>
          ))}

          {filters.priceRange?.map((price) => (
            <Badge key={price} variant="secondary" className="flex items-center gap-1">
              {price}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter('priceRange', price)}
              />
            </Badge>
          ))}

          {filters.rating && filters.rating > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {filters.rating}+ Stars
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ rating: 0 })}
              />
            </Badge>
          )}

          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {filters.location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ location: '' })}
              />
            </Badge>
          )}

          {filters.features?.map((feature) => (
            <Badge key={feature} variant="secondary" className="flex items-center gap-1">
              {feature}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter('features', feature)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
