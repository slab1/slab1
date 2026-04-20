
import React from 'react';
import { Table as TableIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Table } from '@/api/table';
import { TableSelector } from './TableSelector';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupedCombination } from './MultistepBookingForm.types';

interface TableSelectionStepProps {
  availableTables: Table[];
  availableCombinations?: GroupedCombination[];
  selectedTable: string | null;
  selectedCombinationId?: string | null;
  setSelectedTable: (tableId: string | null) => void;
  setSelectedCombinationId?: (combinationId: string | null) => void;
  checkAvailability: () => Promise<void>;
  isSubmitting?: boolean;
}

export const TableSelectionStep: React.FC<TableSelectionStepProps> = ({
  availableTables,
  availableCombinations = [],
  selectedTable,
  selectedCombinationId,
  setSelectedTable,
  setSelectedCombinationId,
  checkAvailability,
  isSubmitting = false
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Automatically check availability if not already done
  React.useEffect(() => {
    const tableCount = availableTables?.length || 0;
    // Only check if we are in this step and have no tables yet
    if (tableCount === 0 && !isSubmitting && !isRefreshing) {
      console.log("TableSelectionStep: Triggering initial availability check");
      checkAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to avoid infinite loops or redundant calls during re-renders

  const handleCheckAvailability = async () => {
    try {
      setIsRefreshing(true);
      await checkAvailability();
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Failed to check availability. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <TableIcon className="mr-2 h-5 w-5 text-primary" />
        Table Selection
      </h3>

      {isSubmitting || isRefreshing ? (
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          </div>
        </Card>
      ) : (!availableTables || availableTables.length === 0) ? (
        <Card className="p-6 text-center border-dashed border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TableIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium mb-1 text-amber-800 dark:text-amber-200">No Tables Available</h4>
              <p className="mb-2 text-sm text-amber-700 dark:text-amber-300">
                We couldn't find any available tables for your selected time and party size.
              </p>
              <p className="text-xs text-muted-foreground">
                Try selecting a different time, date, or reducing your party size.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleCheckAvailability}
              className="w-full sm:w-auto border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {availableTables.length + availableCombinations.length} options available
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCheckAvailability}
              className="text-xs h-8"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
          
          <TableSelector
            availableTables={availableTables}
            availableCombinations={availableCombinations}
            selectedTable={selectedTable}
            selectedCombinationId={selectedCombinationId}
            setSelectedTable={setSelectedTable}
            setSelectedCombinationId={setSelectedCombinationId}
          />
        </div>
      )}
    </div>
  );
};
