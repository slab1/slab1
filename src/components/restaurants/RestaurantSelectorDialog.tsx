import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Restaurant } from '@/api/types';
import { restaurantSearchApi } from '@/api/restaurantSearch';

interface RestaurantSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (restaurant: Restaurant) => void;
  excludeIds?: string[];
}

export function RestaurantSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  excludeIds = []
}: RestaurantSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const results = await restaurantSearchApi.search({ query: searchTerm, limit: 10 });
          // Filter out already selected restaurants
          const filtered = results.restaurants.filter(r => !excludeIds.includes(r.id));
          setSearchResults(filtered);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, excludeIds]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Restaurant to Compare</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {isSearching ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onSelect(restaurant)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <OptimizedImage
                          src={restaurant.image_url || (restaurant as any).image || '/placeholder.svg'}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{restaurant.name}</h4>
                        <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <p className="text-center text-muted-foreground py-8">No restaurants found</p>
            ) : (
              <p className="text-center text-muted-foreground py-8">Type at least 2 characters to search</p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
