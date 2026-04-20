
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, TrendingUp, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

import { OptimizedImage } from '@/components/ui/optimized-image';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image_url: string;
  price: string;
  distance?: string;
  estimated_wait?: string;
  recommendation_reason: string;
}

interface RecommendationProps {
  userId?: string;
  limit?: number;
}

export const SmartRecommendations: React.FC<RecommendationProps> = ({ 
  userId, 
  limit = 6 
}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      
      // For now, we'll create mock recommendations based on user preferences
      // In a real app, this would use ML algorithms or user behavior analysis
      const mockRecommendations: Restaurant[] = [
        {
          id: '1',
          name: 'The Garden Bistro',
          cuisine: 'Mediterranean',
          rating: 4.8,
          image_url: '/api/placeholder/300/200',
          price: '$$',
          distance: '0.8 miles',
          estimated_wait: '15-20 min',
          recommendation_reason: 'Based on your love for Mediterranean cuisine'
        },
        {
          id: '2',
          name: 'Sakura Sushi',
          cuisine: 'Japanese',
          rating: 4.7,
          image_url: '/api/placeholder/300/200',
          price: '$$$',
          distance: '1.2 miles',
          estimated_wait: '25-30 min',
          recommendation_reason: 'Trending in your area'
        },
        {
          id: '3',
          name: 'Mama\'s Kitchen',
          cuisine: 'Italian',
          rating: 4.6,
          image_url: '/api/placeholder/300/200',
          price: '$$',
          distance: '0.5 miles',
          estimated_wait: '10-15 min',
          recommendation_reason: 'Similar to restaurants you\'ve enjoyed'
        },
        {
          id: '4',
          name: 'Spice Route',
          cuisine: 'Indian',
          rating: 4.5,
          image_url: '/api/placeholder/300/200',
          price: '$$',
          distance: '2.1 miles',
          estimated_wait: '20-25 min',
          recommendation_reason: 'New restaurant with great reviews'
        },
        {
          id: '5',
          name: 'Ocean Breeze',
          cuisine: 'Seafood',
          rating: 4.9,
          image_url: '/api/placeholder/300/200',
          price: '$$$',
          distance: '1.8 miles',
          estimated_wait: '30-35 min',
          recommendation_reason: 'Highly rated for special occasions'
        },
        {
          id: '6',
          name: 'The Burger Joint',
          cuisine: 'American',
          rating: 4.4,
          image_url: '/api/placeholder/300/200',
          price: '$',
          distance: '0.3 miles',
          estimated_wait: '5-10 min',
          recommendation_reason: 'Quick bite near you'
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setRecommendations(mockRecommendations.slice(0, limit));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, fetchRecommendations]);

  const getRecommendationIcon = (reason: string) => {
    if (reason.includes('trending') || reason.includes('Trending')) {
      return <TrendingUp className="h-4 w-4 text-orange-500" />;
    }
    if (reason.includes('love') || reason.includes('enjoyed')) {
      return <Heart className="h-4 w-4 text-red-500" />;
    }
    return <Star className="h-4 w-4 text-yellow-500" />;
  };

  const handleBookReservation = (restaurantId: string) => {
    // Navigate to booking page with restaurant ID
    window.location.href = `/booking?restaurant=${restaurantId}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Recommendations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((restaurant) => (
            <div key={restaurant.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3] mb-4">
                <OptimizedImage
                  src={restaurant.image_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90">
                    {restaurant.price}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="capitalize">{restaurant.cuisine}</span>
                  {restaurant.distance && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{restaurant.distance}</span>
                    </div>
                  )}
                  {restaurant.estimated_wait && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{restaurant.estimated_wait}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  {getRecommendationIcon(restaurant.recommendation_reason)}
                  <span className="text-muted-foreground">
                    {restaurant.recommendation_reason}
                  </span>
                </div>
                
                <Button 
                  className="w-full mt-3" 
                  onClick={() => handleBookReservation(restaurant.id)}
                  variant="outline"
                >
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
