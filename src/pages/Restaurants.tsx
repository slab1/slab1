
import { useParams } from "react-router-dom";
import { ErrorDisplay } from "@/components/restaurants/ErrorDisplay";
import { EnhancedLoadingSpinner } from "@/components/ui/enhanced-loading-spinner";
import { SkipLink } from "@/components/accessibility/SkipLink";
import RestaurantDetails from "./RestaurantDetails";
import { useRestaurantsPage } from "@/hooks/pages/useRestaurantsPage";
import { RestaurantsPageLayout } from "@/components/restaurants/RestaurantsPageLayout";

export default function Restaurants() {
  const { id } = useParams();
  const pageHooks = useRestaurantsPage();
  const { isLoading, error, handleRetry, isLoadingFavorites, ScreenReaderAnnouncer } = pageHooks;

  if (id) {
    return <RestaurantDetails />;
  }

  if (isLoading) {
    return (
      <>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <ScreenReaderAnnouncer />
        <main id="main-content" className="flex-1" role="main">
          <div className="container mx-auto px-4 py-12" role="status" aria-label="Loading restaurants">
            <EnhancedLoadingSpinner 
              size="lg" 
              text={isLoadingFavorites ? "Loading your favorites..." : "Loading restaurants..."} 
              variant="default"
            />
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <ScreenReaderAnnouncer />
        <main id="main-content" className="flex-1" role="main">
          <div className="container mx-auto px-4 py-12" role="alert">
            <ErrorDisplay 
              message={error instanceof Error ? error.message : "Unable to load restaurants"}
              onRetry={handleRetry}
            />
          </div>
        </main>
      </>
    );
  }

  return <RestaurantsPageLayout {...pageHooks} />;
}
