
import { useState } from "react";
import { Search, MapPin, Filter, X, Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export function AdvancedSearchFilters({ onFiltersChange, onClearFilters }: AdvancedSearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([1, 4]);
  const [rating, setRating] = useState<number[]>([0]);
  const [features, setFeatures] = useState<string[]>([]);
  const [availability, setAvailability] = useState({
    date: "",
    time: "",
    partySize: ""
  });

  const cuisineOptions = [
    "Italian", "Japanese", "Mexican", "American", "Indian", 
    "Chinese", "French", "Mediterranean", "Thai", "Korean",
    "Vietnamese", "Greek", "Spanish", "Lebanese", "Brazilian"
  ];

  const featureOptions = [
    "Outdoor Seating", "Live Music", "Full Bar", "Wine Bar",
    "Private Dining", "Valet Parking", "Wheelchair Accessible",
    "Pet Friendly", "Brunch", "Late Night", "Delivery", "Takeout"
  ];

  const handleCuisineToggle = (cuisine: string) => {
    setCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleFeatureToggle = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const applyFilters = () => {
    const filters = {
      search: searchTerm,
      location,
      cuisines,
      priceRange,
      minRating: rating[0],
      features,
      availability
    };
    onFiltersChange(filters);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setLocation("");
    setCuisines([]);
    setPriceRange([1, 4]);
    setRating([0]);
    setFeatures([]);
    setAvailability({ date: "", time: "", partySize: "" });
    onClearFilters();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search & Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="space-y-2">
          <Label>Search Restaurants</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Restaurant name, cuisine, or dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="City, neighborhood, or zip code..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-4">
          <Label>Check Availability</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={availability.date}
                  onChange={(e) => setAvailability(prev => ({ ...prev, date: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={availability.time}
                  onChange={(e) => setAvailability(prev => ({ ...prev, time: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Party Size</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="2"
                  value={availability.partySize}
                  onChange={(e) => setAvailability(prev => ({ ...prev, partySize: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <Label>Price Range</Label>
          <div className="px-3">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={4}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>$ Budget</span>
              <span>$$ Moderate</span>
              <span>$$$ Upscale</span>
              <span>$$$$ Fine Dining</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-4">
          <Label>Minimum Rating</Label>
          <div className="px-3">
            <Slider
              value={rating}
              onValueChange={setRating}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Any Rating</span>
              <span>{rating[0]}+ Stars</span>
            </div>
          </div>
        </div>

        {/* Cuisines */}
        <div className="space-y-4">
          <Label>Cuisine Types</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {cuisineOptions.map((cuisine) => (
              <div key={cuisine} className="flex items-center space-x-2">
                <Checkbox
                  id={cuisine}
                  checked={cuisines.includes(cuisine)}
                  onCheckedChange={() => handleCuisineToggle(cuisine)}
                />
                <Label htmlFor={cuisine} className="text-sm cursor-pointer">
                  {cuisine}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <Label>Restaurant Features</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {featureOptions.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={features.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <Label htmlFor={feature} className="text-sm cursor-pointer">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(cuisines.length > 0 || features.length > 0) && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((cuisine) => (
                <Badge key={cuisine} variant="secondary" className="gap-1">
                  {cuisine}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCuisineToggle(cuisine)}
                  />
                </Badge>
              ))}
              {features.map((feature) => (
                <Badge key={feature} variant="outline" className="gap-1">
                  {feature}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFeatureToggle(feature)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
