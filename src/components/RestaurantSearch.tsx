import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Utensils, 
  DollarSign,
  X,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";

interface RestaurantSearchProps {
  onSearch?: (query: string) => void;
}

export function RestaurantSearch({ onSearch }: RestaurantSearchProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "");
  const [price, setPrice] = useState<string[]>(
    searchParams.get("price") 
      ? searchParams.get("price")!.split(",") 
      : []
  );
  const [features, setFeatures] = useState<string[]>(
    searchParams.get("features")
      ? searchParams.get("features")!.split(",")
      : []
  );
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set("search", searchTerm);
    if (location) params.set("location", location);
    if (cuisine) params.set("cuisine", cuisine);
    if (price.length) params.set("price", price.join(","));
    if (features.length) params.set("features", features.join(","));
    
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/restaurants?${params.toString()}`);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setCuisine("");
    setPrice([]);
    setFeatures([]);
    navigate("/restaurants");
  };
  
  const hasActiveFilters = !!(location || cuisine || price.length || features.length);
  
  const cuisineOptions = [
    { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" },
    { value: "mexican", label: "Mexican" },
    { value: "indian", label: "Indian" },
    { value: "french", label: "French" },
    { value: "chinese", label: "Chinese" },
    { value: "thai", label: "Thai" },
    { value: "american", label: "American" },
    { value: "mediterranean", label: "Mediterranean" },
  ];
  
  const featureOptions = [
    { id: "outdoor", label: "Outdoor Seating" },
    { id: "delivery", label: "Delivery" },
    { id: "takeout", label: "Takeout" },
    { id: "reservations", label: "Accepts Reservations" },
    { id: "wheelchair", label: "Wheelchair Accessible" },
    { id: "parking", label: "Parking Available" },
    { id: "wifi", label: "Free Wifi" },
    { id: "vegetarian", label: "Vegetarian Options" },
    { id: "vegan", label: "Vegan Options" },
    { id: "gluten_free", label: "Gluten-Free Options" },
  ];
  
  const FilterContent = () => (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <Label htmlFor="location-filter">Location</Label>
        <Input
          id="location-filter"
          placeholder="City or Neighborhood"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cuisine-filter">Cuisine</Label>
        <Select value={cuisine} onValueChange={setCuisine}>
          <SelectTrigger id="cuisine-filter">
            <SelectValue placeholder="Select cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Cuisines</SelectItem>
            {cuisineOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Price</Label>
        <div className="flex space-x-2">
          {["$", "$$", "$$$", "$$$$"].map((priceOption) => (
            <Button
              key={priceOption}
              type="button"
              variant={price.includes(priceOption) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (price.includes(priceOption)) {
                  setPrice(price.filter(p => p !== priceOption));
                } else {
                  setPrice([...price, priceOption]);
                }
              }}
            >
              {priceOption}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Features</Label>
        <div className="grid grid-cols-2 gap-2">
          {featureOptions.map((feature) => (
            <div key={feature.id} className="flex items-center space-x-2">
              <Checkbox
                id={feature.id}
                checked={features.includes(feature.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFeatures([...features, feature.id]);
                  } else {
                    setFeatures(features.filter(f => f !== feature.id));
                  }
                }}
              />
              <Label 
                htmlFor={feature.id}
                className="text-sm font-normal cursor-pointer"
              >
                {feature.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card shadow-sm border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              placeholder="Search restaurants, cuisines, dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
                  Filters
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filter Restaurants</DrawerTitle>
                  <DrawerDescription>
                    Apply filters to find the perfect restaurant
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                  <FilterContent />
                </div>
                <DrawerFooter className="pt-2">
                  <div className="flex gap-2">
                    <Button onClick={handleSearch}>Apply Filters</Button>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" /> Clear
                      </Button>
                    )}
                  </div>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                  <FilterContent />
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                    >
                      <X className="h-4 w-4 mr-2" /> Clear
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSearch}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {location && (
              <div className="flex items-center bg-muted text-sm px-2 py-1 rounded-full">
                <MapPin className="h-3 w-3 mr-1" />
                {location}
                <button onClick={() => setLocation("")} className="ml-1 hover:text-primary">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {cuisine && (
              <div className="flex items-center bg-muted text-sm px-2 py-1 rounded-full">
                <Utensils className="h-3 w-3 mr-1" />
                {cuisineOptions.find(c => c.value === cuisine)?.label || cuisine}
                <button onClick={() => setCuisine("")} className="ml-1 hover:text-primary">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {price.length > 0 && (
              <div className="flex items-center bg-muted text-sm px-2 py-1 rounded-full">
                <DollarSign className="h-3 w-3 mr-1" />
                {price.join(", ")}
                <button onClick={() => setPrice([])} className="ml-1 hover:text-primary">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {features.length > 0 && features.map(feature => (
              <div key={feature} className="flex items-center bg-muted text-sm px-2 py-1 rounded-full">
                {featureOptions.find(f => f.id === feature)?.label || feature}
                <button 
                  onClick={() => setFeatures(features.filter(f => f !== feature))} 
                  className="ml-1 hover:text-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
