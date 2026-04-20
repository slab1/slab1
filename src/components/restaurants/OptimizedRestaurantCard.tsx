import React, { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, DollarSign, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "@/api/types";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface OptimizedRestaurantCardProps {
  restaurant: Restaurant;
  priority?: boolean; // For image loading priority
  onFavoriteToggle?: (restaurantId: string) => void;
  isFavorite?: boolean;
}

export const OptimizedRestaurantCard = memo(function OptimizedRestaurantCard({
  restaurant,
  priority = false,
  onFavoriteToggle,
  isFavorite = false,
}: OptimizedRestaurantCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(restaurant.id);
  };

  // Get primary location
  const primaryLocation = restaurant.restaurant_locations?.[0];

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return '$'.repeat(Math.min(Math.max(Math.ceil(numPrice / 25), 1), 4));
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
      <div className="relative" onClick={handleViewDetails}>
        {/* Image Container */}
        <div className="aspect-video relative overflow-hidden bg-muted">
          {restaurant.image_url ? (
            <OptimizedImage
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
          
          {/* Favorite Button */}
          {onFavoriteToggle && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star 
                className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} 
              />
            </Button>
          )}

          {/* Cuisine Badge */}
          {restaurant.cuisine && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-white/90 text-gray-800"
            >
              {restaurant.cuisine}
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            {restaurant.price && (
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-3 w-3 mr-1" />
                {formatPrice(restaurant.price)}
              </div>
            )}
          </div>
          
          {restaurant.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {restaurant.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Location */}
            {primaryLocation && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">
                  {primaryLocation.city}, {primaryLocation.state}
                </span>
              </div>
            )}

            {/* Operating Hours */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Open today</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={handleViewDetails}
              >
                View Details
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/booking?restaurant=${restaurant.id}`);
                }}
              >
                Book Now
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
});