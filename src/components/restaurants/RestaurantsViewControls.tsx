
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Map } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RestaurantsViewControlsProps {
  viewMode: 'grid' | 'list' | 'map';
  onViewModeChange: (mode: 'grid' | 'list' | 'map') => void;
  useInfiniteScrollMode: boolean;
  onInfiniteScrollModeChange: (enabled: boolean) => void;
  totalCount: number;
}

export function RestaurantsViewControls({
  viewMode,
  onViewModeChange,
  useInfiniteScrollMode,
  onInfiniteScrollModeChange,
  totalCount
}: RestaurantsViewControlsProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="text-sm text-muted-foreground" aria-live="polite" role="status">
            {totalCount} restaurants found
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="View options">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              {!isMobile && <span className="ml-2">Grid</span>}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              {!isMobile && <span className="ml-2">List</span>}
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('map')}
              aria-label="Map view"
              aria-pressed={viewMode === 'map'}
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              {!isMobile && <span className="ml-2">Map</span>}
            </Button>
          </div>
        </div>
        {viewMode !== 'map' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Scroll mode:</span>
            <Button
              variant={useInfiniteScrollMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onInfiniteScrollModeChange(!useInfiniteScrollMode)}
              aria-label={`Switch to ${useInfiniteScrollMode ? 'pagination' : 'infinite scroll'} mode`}
            >
              {useInfiniteScrollMode ? 'Infinite' : 'Pagination'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
