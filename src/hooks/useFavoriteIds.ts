import { useQuery } from '@tanstack/react-query';
import { favoritesApi } from '@/api/favorites';
import { useAuth } from './use-auth';

export const useFavoriteIds = () => {
  const { user } = useAuth();

  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favoriteIds', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const favorites = await favoritesApi.getUserFavorites();
      return favorites.map(f => f.restaurant_id);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 mins
  });

  return {
    favoriteIds: favorites || [],
    isLoading,
    error,
  };
};
