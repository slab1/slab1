import { useQuery } from '@tanstack/react-query';
import { favoritesApi } from '@/api/favorites';
import { useAuth } from './use-auth';

export const useFavoritesList = () => {
  const { user } = useAuth();

  const queryKey = ['favorites', user?.id];

  const { data: favorites, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!user) return [];
      return favoritesApi.getUserFavorites();
    },
    enabled: !!user,
  });

  // Extract restaurants from favorites
  const favoriteRestaurants = favorites?.map(f => f.restaurant).filter(Boolean) || [];

  return {
    favoriteRestaurants,
    favorites: favorites || [],
    isLoading,
    error,
    refetch
  };
};
