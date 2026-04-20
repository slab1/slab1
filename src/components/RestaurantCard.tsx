import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, DollarSign, Heart, ArrowRightLeft } from "lucide-react";
import { Restaurant } from "@/api/types";
import { cn } from "@/lib/utils";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { FocusOutline } from "@/components/accessibility/FocusOutline";
import { useQuery } from "@tanstack/react-query";
import { optimizedRestaurantApi } from "@/api/restaurant/optimized";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";

import { OptimizedImage } from "@/components/ui/optimized-image";

interface RestaurantCardProps {
  restaurant: Restaurant;
  viewMode?: 'grid' | 'list';
  featured?: boolean;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onCompare?: (restaurantIds: string[]) => void;
  showCompare?: boolean;
}

export function RestaurantCard({
  restaurant,
  viewMode = 'grid',
  featured = false,
  onClick,
  isFavorite: propIsFavorite,
  onToggleFavorite: propOnToggleFavorite,
  onCompare,
  showCompare,
}: RestaurantCardProps) {
  const isListView = viewMode === 'list';

  useKeyboardNavigation({
    onEnter: onClick,
    onSpace: onClick,
  });

  const { isFavorite, toggleFavorite, isLoading: isLoadingFavorite, isToggling: isTogglingFavorite } = useFavorites(restaurant.id);

  const firstLocationId = restaurant.locations?.[0]?.id;

  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', firstLocationId],
    queryFn: () => optimizedRestaurantApi.checkAvailability(firstLocationId!, 2), // assume party of 2
    enabled: !!firstLocationId,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Format features for better accessibility with fallback for null/undefined
  const featuresArray = restaurant.features 
    ? (typeof restaurant.features === 'string' 
        ? restaurant.features.split(',').map(f => f.trim()).filter(Boolean)
        : [])
    : [];

  // Provide fallback values for missing data
  const displayCuisine = restaurant.cuisine || "Restaurant";
  const displayPrice = restaurant.price || "$$";
  const displayRating = restaurant.rating || 4.0;
  const displayDescription = restaurant.description || "Great dining experience awaits you";

  return (
    <FocusOutline>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isListView && "flex",
          featured && "ring-2 ring-primary"
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${restaurant.name}, ${displayCuisine} cuisine, rated ${displayRating} stars`}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            isListView ? "w-48 flex-shrink-0" : "aspect-video"
          )}
        >
          <OptimizedImage
            src={restaurant.image_url || "/placeholder.svg"}
            alt={`${restaurant.name} restaurant interior`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            priority={featured}
          />
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 flex items-center gap-1"
            aria-label={`Price range: ${displayPrice}`}
          >
            <DollarSign className="h-3 w-3" aria-hidden="true" />
            <span>{displayPrice}</span>
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 rounded-full h-8 w-8 bg-black/50 hover:bg-black/70 text-white z-10"
            onClick={(e) => {
                e.stopPropagation(); // prevent card click
                toggleFavorite();
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            disabled={isLoadingFavorite || isTogglingFavorite}
          >
            <Heart className={cn(
                "h-4 w-4",
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
            )} />
          </Button>

          {showCompare && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-12 rounded-full h-8 w-8 bg-black/50 hover:bg-black/70 text-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                onCompare?.([restaurant.id]);
              }}
              aria-label="Add to comparison"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardContent
          className={cn(
            "p-4 flex-1",
            isListView && "flex flex-col justify-between"
          )}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "font-semibold transition-colors group-hover:text-primary line-clamp-2",
                  isListView ? "text-lg" : "text-xl"
                )}
              >
                {restaurant.name}
              </h3>
              <div 
                className="flex items-center gap-1 text-sm flex-shrink-0"
                aria-label={`Rating: ${displayRating} out of 5 stars`}
              >
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                <span className="font-medium">{displayRating}</span>
              </div>
            </div>
            
            <p className={cn(
              "text-muted-foreground line-clamp-2",
              isListView ? "text-sm" : ""
            )}>
              {displayDescription}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {displayCuisine}
              </Badge>
            </div>
          </div>

          {restaurant.locations && restaurant.locations.length > 0 ? (
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground",
                isListView ? "mt-2" : "mt-4"
              )}
            >
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>
                  {(() => {
                    const loc = restaurant.locations![0];
                    const address = loc.address as any;
                    // Handle JSONB address structure
                    const city = typeof address === 'object' ? address?.city : loc.city;
                    const state = typeof address === 'object' ? address?.state : loc.state;
                    return city ? `${city}${state ? `, ${state}` : ''}` : "Location";
                  })()}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {isLoadingAvailability ? (
                    <span className="text-xs animate-pulse">Checking...</span>
                ) : availability?.availableNow ? (
                    <span className="text-green-600 font-semibold">Available Now</span>
                ) : availability?.nextAvailableSlot ? (
                    <span className="text-sm">Next: {availability.nextAvailableSlot}</span>
                ) : (
                    <span className="text-sm text-muted-foreground">Check availability</span>
                )}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground",
                isListView ? "mt-2" : "mt-4"
              )}
            >
              <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>Click to view details & book</span>
            </div>
          )}

          {featuresArray.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-1",
                isListView ? "mt-2" : "mt-3"
              )}
            >
              {featuresArray.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {featuresArray.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{featuresArray.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </FocusOutline>
  );
}
