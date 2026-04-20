import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/api/favorites';
import { useAuth } from './use-auth';
import { useToast } from '@/components/ui/use-toast';

export const useFavorites = (restaurantId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = ['favorite', user?.id, restaurantId];

  const { data: isFavorite, isLoading: isLoadingFavorite } = useQuery({
    queryKey,
    queryFn: () => {
      if (!user) return false;
      return favoritesApi.isFavorite(restaurantId);
    },
    enabled: !!user,
  });

  const { mutate: toggleFavoriteMutation, isPending: isTogglingFavorite } = useMutation({
    mutationFn: async (currentIsFavorite: boolean) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add restaurants to your favorites.",
          variant: 'destructive',
        });
        throw new Error('User not authenticated');
      }
      if (currentIsFavorite) {
        await favoritesApi.remove(restaurantId);
      } else {
        await favoritesApi.add(restaurantId);
      }
    },
    onMutate: async (currentIsFavorite: boolean) => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, !currentIsFavorite);
      return { previousState };
    },
    onError: (err, newIsFavorite, context) => {
      queryClient.setQueryData(queryKey, context?.previousState);
      toast({
        title: 'Error',
        description: `Failed to update favorites.`,
        variant: 'destructive',
      });
    },
    onSuccess: (data, currentIsFavorite) => {
      toast({
        title: 'Success!',
        description: `Restaurant ${currentIsFavorite ? 'removed from' : 'added to'} favorites.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favoriteIds', user?.id] });
    },
  });

  return {
    isFavorite: !!isFavorite,
    isLoading: isLoadingFavorite,
    isToggling: isTogglingFavorite,
    toggleFavorite: () => {
      if (user) {
        toggleFavoriteMutation(!!isFavorite);
      } else {
        toast({
          title: "Authentication required",
          description: "Please log in to add restaurants to your favorites.",
          variant: 'destructive',
        });
      }
    },
  };
};
