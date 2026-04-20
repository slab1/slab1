
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Restaurant } from "@/api/types";
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Utensils, MapPin, CalendarDays, MessageSquare, Clock, Users, Menu } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface RestaurantNavCardProps {
  restaurant: Restaurant;
  onSelectRestaurant: (id: string) => void;
  className?: string;
}

export function RestaurantNavCard({ restaurant, onSelectRestaurant, className = '' }: RestaurantNavCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const getLocationCount = () => {
    return restaurant.locations?.length || 0;
  };

  // Quick actions for restaurant management
  const restaurantActions = [
    { 
      label: "Menu", 
      icon: Menu, 
      action: () => {
        onSelectRestaurant(restaurant.id);
        navigate('/restaurant-owner?tab=menu');
      }
    },
    { 
      label: "Waitlist", 
      icon: Clock, 
      action: () => {
        onSelectRestaurant(restaurant.id);
        navigate('/restaurant-owner?tab=waitlist');
      }
    },
    { 
      label: "Reservations", 
      icon: CalendarDays, 
      action: () => {
        onSelectRestaurant(restaurant.id); 
        navigate('/restaurant-owner?tab=reservations');
      }
    },
    { 
      label: "Settings", 
      icon: Users, 
      action: () => {
        onSelectRestaurant(restaurant.id);
        navigate('/restaurant-owner?tab=settings');
      }
    }
  ];

  return (
    <Card 
      className={`${className} transition-all duration-300 hover:shadow-md ${isHovered ? 'border-primary/50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{restaurant.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              {getLocationCount()} {getLocationCount() === 1 ? 'location' : 'locations'}
            </CardDescription>
          </div>
          {restaurant.image_url ? (
            <div className="h-12 w-12 rounded overflow-hidden">
              <OptimizedImage 
                src={restaurant.image_url} 
                alt={restaurant.name} 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
              <Utensils className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {restaurant.cuisine && (
            <Badge variant="outline">{restaurant.cuisine}</Badge>
          )}
          {restaurant.price && (
            <Badge variant="outline">{restaurant.price}</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {restaurantActions.map((action, index) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm"
              className="justify-start text-sm"
              onClick={action.action}
            >
              <action.icon className="mr-1.5 h-3.5 w-3.5" />
              {action.label}
            </Button>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-2 text-primary justify-between"
          onClick={() => {
            onSelectRestaurant(restaurant.id);
            navigate('/restaurant-owner');
          }}
        >
          View Restaurant Dashboard
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
