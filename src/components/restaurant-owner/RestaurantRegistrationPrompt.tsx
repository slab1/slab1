import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Restaurant, PartnerSubscription } from "@/api/types";

interface RestaurantRegistrationPromptProps {
  restaurants: Restaurant[];
  subscription: PartnerSubscription;
  onUpgrade: () => void;
  onManage: () => void;
}

export const RestaurantRegistrationPrompt = ({ 
  restaurants, 
  subscription 
}: RestaurantRegistrationPromptProps) => {
  const navigate = useNavigate();
  
  const maxRestaurants = subscription?.maxLocations || 1;
  const currentRestaurants = restaurants.length;
  const canAddMore = currentRestaurants < maxRestaurants;

  if (!canAddMore) return null;

  return (
    <Card className="border-dashed border-2">
      <CardHeader>
        <CardTitle className="text-lg">Add Another Restaurant</CardTitle>
        <CardDescription>
          Expand your business by registering another location or brand.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => navigate("/restaurant-registration")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Register New Restaurant
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Current plan: {currentRestaurants} of {maxRestaurants} restaurants used.
        </p>
      </CardContent>
    </Card>
  );
};
