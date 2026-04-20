
import { Restaurant } from '@/api/types';
import { FreeMap } from './FreeMap';

interface RestaurantsMapProps {
  restaurants: Restaurant[];
  onRestaurantClick?: (restaurant: Restaurant) => void;
  height?: string;
  userLocation?: [number, number];
}

export function RestaurantsMap({ 
  restaurants, 
  onRestaurantClick, 
  height = '400px',
  userLocation
}: RestaurantsMapProps) {
  return (
    <FreeMap 
      restaurants={restaurants} 
      height={height}
      onRestaurantClick={onRestaurantClick}
      userLocation={userLocation}
      zoom={12}
    />
  );
}
