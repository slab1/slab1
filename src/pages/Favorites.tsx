import { useFavoritesList } from '@/hooks/useFavoritesList';
import { RestaurantList } from '@/components/restaurants/RestaurantList';
import { EnhancedLoadingSpinner } from '@/components/ui/enhanced-loading-spinner';
import { ErrorDisplay } from '@/components/restaurants/ErrorDisplay';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function Favorites() {
  const { user } = useAuth();
  const { favoriteRestaurants, isLoading, error, refetch } = useFavoritesList();
  const navigate = useNavigate();

  const handleRestaurantClick = (restaurant: any) => {
    const identifier = restaurant.slug || restaurant.id;
    navigate(`/restaurants/${identifier}`);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to see your favorite restaurants.</p>
          <Button asChild>
              <Link to="/login">Log in</Link>
          </Button>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <EnhancedLoadingSpinner text="Loading your favorites..." />
        </div>
      );
    }

    if (error) {
      return <ErrorDisplay 
                message={error instanceof Error ? error.message : "Failed to load favorites."}
                onRetry={refetch}
             />;
    }
    
    if (favoriteRestaurants.length === 0) {
      return (
         <div className="text-center py-12">
            <div className="bg-muted inline-flex rounded-full p-6 mb-4">
              <Heart className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No favorite restaurants yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring and add some restaurants to your favorites!
            </p>
            <Button asChild>
              <Link to="/restaurants">Explore Restaurants</Link>
            </Button>
         </div>
      );
    }

    return (
      <RestaurantList
        isLoading={false}
        restaurants={favoriteRestaurants}
        clearFilters={() => {}}
        onRestaurantClick={handleRestaurantClick}
        viewMode="grid"
      />
    );
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">My Favorite Restaurants</h1>
          <p className="text-muted-foreground mt-2">The places you love, all in one spot.</p>
        </div>
        {renderContent()}
      </div>
    </section>
  );
}
