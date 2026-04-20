
import { RestaurantLocation } from '@/api/types';
import { FreeMap } from './FreeMap';

interface RestaurantLocationMapProps {
  location: RestaurantLocation;
  height?: string;
  showPopup?: boolean;
}

export function RestaurantLocationMap({ 
  location, 
  height = '300px', 
  showPopup = true 
}: RestaurantLocationMapProps) {
  if (!location) return null;

  return (
    <FreeMap 
      locations={[location]} 
      height={height}
      zoom={15}
    />
  );
}
