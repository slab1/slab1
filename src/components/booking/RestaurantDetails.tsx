
import React from 'react';
import { Restaurant } from '@/api/types';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface RestaurantDetailsProps {
  restaurant: Restaurant;
}

export const RestaurantDetails: React.FC<RestaurantDetailsProps> = ({ restaurant }) => {
  return (
    <div className="mb-6">
      {restaurant.image_url && (
        <div className="aspect-video w-full rounded-lg overflow-hidden mb-4">
          <OptimizedImage 
            src={restaurant.image_url} 
            alt={restaurant.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <h2 className="text-xl font-semibold">{restaurant.name}</h2>
      
      {restaurant.description && (
        <p className="text-muted-foreground text-sm mt-1">{restaurant.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mt-3">
        {restaurant.cuisine && (
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
            {restaurant.cuisine}
          </span>
        )}
        {restaurant.price && (
          <span className="bg-muted text-xs px-2 py-1 rounded-full">
            {restaurant.price}
          </span>
        )}
      </div>
    </div>
  );
};
