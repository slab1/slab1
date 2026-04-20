
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedRecommendationService } from "@/services/optimizedRecommendationService";
import { RestaurantCard } from "@/components/RestaurantCard";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { safeAsync } from "@/utils/error-handling";
import type { Restaurant } from "@/api/types";

export function PersonalizedRecommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    const result = await safeAsync(async () => {
      const data = await optimizedRecommendationService.getPersonalizedRecommendations({});
      return data.restaurants;
    });

    if (result) {
      setRecommendations(result);
    } else {
      setError('Failed to load recommendations. Please try again.');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    const identifier = restaurant.slug || restaurant.id;
    navigate(`/booking/${identifier}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        message={error} 
        onRetry={loadRecommendations}
      />
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No recommendations available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((restaurant) => (
          <RestaurantCard 
            key={restaurant.id} 
            restaurant={restaurant} 
            onClick={() => handleRestaurantClick(restaurant)}
          />
        ))}
      </div>
    </div>
  );
}
