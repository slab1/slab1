
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/api/types";

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelect: (restaurant: Restaurant) => void;
}

export const RestaurantSelector = ({ 
  restaurants, 
  selectedRestaurant, 
  onSelect 
}: RestaurantSelectorProps) => {
  if (restaurants.length <= 1) return null;

  return (
    <div className="flex gap-2">
      {restaurants.map((restaurant) => (
        <Button
          key={restaurant.id}
          variant={selectedRestaurant?.id === restaurant.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(restaurant)}
        >
          {restaurant.name}
        </Button>
      ))}
    </div>
  );
};
