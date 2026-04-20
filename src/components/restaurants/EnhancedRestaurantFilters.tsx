
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X, MapPin, Star, DollarSign, ArrowDownUp, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { enhancedRestaurantApi, RestaurantFilters } from "@/api/restaurant/enhanced";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EnhancedRestaurantFiltersProps {
  filters: RestaurantFilters;
  onFiltersChange: (filters: RestaurantFilters) => void;
  onClearFilters: () => void;
}

export function EnhancedRestaurantFilters({
  filters,
  onFiltersChange,
  onClearFilters
}: EnhancedRestaurantFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const { user } = useAuth();

  const debouncedSearch = useDebounce(searchValue, 300);

  // Fetch filter options
  const { data: cuisineOptions = [] } = useQuery({
    queryKey: ["cuisine-options"],
    queryFn: enhancedRestaurantApi.getCuisineOptions,
  });

  const { data: cityOptions = [] } = useQuery({
    queryKey: ["city-options"],
    queryFn: enhancedRestaurantApi.getCityOptions,
  });

  // Handle search autocomplete
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.length >= 2) {
      enhancedRestaurantApi.searchWithAutocomplete(debouncedSearch).then(results => {
        setAutocompleteResults(results);
        setShowAutocomplete(results.length > 0);
      });
    } else {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
    }
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFiltersChange({ ...filters, search: value });
  };

  const handleCuisineToggle = (cuisine: string) => {
    const currentCuisines = filters.cuisine || [];
    const newCuisines = currentCuisines.includes(cuisine)
      ? currentCuisines.filter(c => c !== cuisine)
      : [...currentCuisines, cuisine];
    
    onFiltersChange({ ...filters, cuisine: newCuisines });
  };

  const handlePriceRangeToggle = (price: string) => {
    const currentPrices = filters.priceRange || [];
    const newPrices = currentPrices.includes(price)
      ? currentPrices.filter(p => p !== price)
      : [...currentPrices, price];
    
    onFiltersChange({ ...filters, priceRange: newPrices });
  };

  const handleRatingChange = (rating: number[]) => {
    onFiltersChange({ ...filters, minRating: rating[0] });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.cuisine?.length) count += filters.cuisine.length;
    if (filters.priceRange?.length) count += filters.priceRange.length;
    if (filters.minRating && filters.minRating > 0) count++;
    if (filters.city) count++;
    if (filters.state) count++;
    if (filters.favoritesOnly) count++;
    return count;
  }, [filters]);

  const priceRanges = [
    { value: "$", label: "$ - Budget" },
    { value: "$$", label: "$$ - Moderate" },
    { value: "$$$", label: "$$$ - Upscale" },
    { value: "$$$$", label: "$$$$ - Fine Dining" }
  ];

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants, cuisines, or dishes..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              onFocus={() => setShowAutocomplete(autocompleteResults.length > 0)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && (
            <Card className="absolute z-10 w-full mt-1 p-2 max-h-48 overflow-y-auto">
              {autocompleteResults.map((result, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => {
                    setSearchValue(result);
                    handleSearchChange(result);
                    setShowAutocomplete(false);
                  }}
                >
                  <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                  {result}
                </Button>
              ))}
            </Card>
          )}
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {/* Favorites Toggle */}
          {user ? (
            <div className="flex items-center space-x-2">
              <Switch
                id="favorites-only"
                checked={!!filters.favoritesOnly}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, favoritesOnly: checked })}
              />
              <Label htmlFor="favorites-only" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                My Favorites
              </Label>
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                    <Switch id="favorites-only-disabled" disabled />
                    <Label htmlFor="favorites-only-disabled" className="text-sm font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      My Favorites
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Log in to filter by your favorites</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="flex-grow flex flex-wrap gap-2 items-center">
            {/* Active Filter Badges */}
            {filters.favoritesOnly && (
              <Badge variant="secondary" className="flex items-center gap-1 border border-pink-200 bg-pink-50 text-pink-700">
                <Heart className="h-3 w-3" />
                Favorites
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onFiltersChange({ ...filters, favoritesOnly: false })}
                />
              </Badge>
            )}
            {filters.cuisine?.map(cuisine => (
              <Badge key={cuisine} variant="secondary" className="flex items-center gap-1">
                {cuisine}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleCuisineToggle(cuisine)}
                />
              </Badge>
            ))}

            {filters.priceRange?.map(price => (
              <Badge key={price} variant="secondary" className="flex items-center gap-1">
                {price}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handlePriceRangeToggle(price)}
                />
              </Badge>
            ))}

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground ml-auto"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Cuisine Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Cuisine Type
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {cuisineOptions.map(cuisine => (
                  <div key={cuisine} className="flex items-center space-x-2">
                    <Checkbox
                      id={cuisine}
                      checked={filters.cuisine?.includes(cuisine) || false}
                      onCheckedChange={() => handleCuisineToggle(cuisine)}
                    />
                    <label htmlFor={cuisine} className="text-sm cursor-pointer">
                      {cuisine}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range
              </label>
              <div className="space-y-1">
                {priceRanges.map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={value}
                      checked={filters.priceRange?.includes(value) || false}
                      onCheckedChange={() => handlePriceRangeToggle(value)}
                    />
                    <label htmlFor={value} className="text-sm cursor-pointer">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Minimum Rating: {filters.minRating || 0}★
              </label>
              <Slider
                value={[filters.minRating || 0]}
                onValueChange={handleRatingChange}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City
              </label>
              <Select
                value={filters.city || ""}
                onValueChange={(value) => onFiltersChange({ ...filters, city: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  {cityOptions.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4" />
                Sort By
              </label>
              <Select
                value={filters.sortBy || "rating"}
                onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as RestaurantFilters['sortBy'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Best Rating</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
