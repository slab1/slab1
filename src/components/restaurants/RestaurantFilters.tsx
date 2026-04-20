
import { useState, useEffect } from "react";
import { X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Sample cuisine types for filtering
const cuisineTypes = [
  "Italian", "Japanese", "Mexican", "American", "Indian", 
  "Chinese", "French", "Mediterranean", "Thai", "Vegetarian"
];

interface RestaurantFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCuisines: string[];
  setSelectedCuisines: (value: string[]) => void;
}

export function RestaurantFilters({
  searchTerm,
  setSearchTerm,
  selectedCuisines,
  setSelectedCuisines
}: RestaurantFiltersProps) {
  const toggleCuisine = (cuisine: string) => {
    // Fix: Ensure we're passing a new array, not a function
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCuisines([]);
  };

  return (
    <div className="bg-background rounded-xl shadow-sm p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search restaurants, cuisines, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Cuisine
                {selectedCuisines.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedCuisines.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {cuisineTypes.map((cuisine) => (
                <DropdownMenuCheckboxItem
                  key={cuisine}
                  checked={selectedCuisines.includes(cuisine)}
                  onCheckedChange={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(searchTerm || selectedCuisines.length > 0) && (
            <Button variant="ghost" onClick={clearFilters} size="icon">
              <X className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>
      </div>
      
      {selectedCuisines.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedCuisines.map(cuisine => (
            <Badge 
              key={cuisine} 
              variant="secondary"
              className="gap-1"
            >
              {cuisine}
              <button 
                onClick={() => toggleCuisine(cuisine)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {cuisine} filter</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
