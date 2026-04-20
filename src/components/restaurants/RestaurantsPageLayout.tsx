
import { GlobalErrorBoundary } from "@/components/ErrorBoundary/GlobalErrorBoundary";
import { RestaurantsHeader } from "@/components/restaurants/RestaurantsHeader";
import { RestaurantsViewControls } from "@/components/restaurants/RestaurantsViewControls";
import { RestaurantsContent } from "@/components/restaurants/RestaurantsContent";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { EnhancedRestaurantFilters } from "@/components/restaurants/EnhancedRestaurantFilters";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { useRestaurantsPage } from "@/hooks/pages/useRestaurantsPage";

type RestaurantsPageLayoutProps = ReturnType<typeof useRestaurantsPage>;

export function RestaurantsPageLayout({
  isMobile,
  filters,
  viewMode,
  useInfiniteScrollMode,
  isFilterSheetOpen,
  restaurantData,
  isFetching,
  hasNextPage,
  currentPage,
  totalPages,
  handleFiltersChange,
  handleViewModeChange,
  handleRestaurantClick,
  clearFilters,
  setUseInfiniteScrollMode,
  setIsFilterSheetOpen,
  goToPage,
  ScreenReaderAnnouncer,
}: RestaurantsPageLayoutProps) {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <ScreenReaderAnnouncer />
      
      <main id="main-content" className="flex-1" role="main">
        <section className="bg-muted/30 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <RestaurantsHeader />

            <div className="mb-6">
              {isMobile ? (
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Filter Restaurants</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-xs">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <GlobalErrorBoundary level="component">
                        <EnhancedRestaurantFilters
                          filters={filters}
                          onFiltersChange={handleFiltersChange}
                          onClearFilters={clearFilters}
                        />
                      </GlobalErrorBoundary>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <GlobalErrorBoundary level="component">
                  <EnhancedRestaurantFilters 
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={clearFilters}
                  />
                </GlobalErrorBoundary>
              )}
            </div>

            <GlobalErrorBoundary level="component">
              <RestaurantsViewControls
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                useInfiniteScrollMode={useInfiniteScrollMode}
                onInfiniteScrollModeChange={setUseInfiniteScrollMode}
                totalCount={restaurantData?.totalCount || 0}
              />
            </GlobalErrorBoundary>

            <GlobalErrorBoundary level="component">
              <div className="space-y-6">
                <RestaurantsContent
                  viewMode={viewMode}
                  restaurants={restaurantData?.restaurants || []}
                  isLoading={false}
                  isFetching={isFetching}
                  useInfiniteScrollMode={useInfiniteScrollMode}
                  hasNextPage={hasNextPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onRestaurantClick={handleRestaurantClick}
                  onPageChange={goToPage}
                  clearFilters={clearFilters}
                />
              </div>
            </GlobalErrorBoundary>
          </div>
        </section>
      </main>
    </>
  );
}
