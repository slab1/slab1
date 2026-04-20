
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table as TableIcon, Users, Info, Check } from 'lucide-react';
import { VisualTableSelector } from './VisualTableSelector';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Table } from '@/api/types';
import { GroupedCombination } from './MultistepBookingForm.types';

interface TableSelectorProps {
  availableTables: Table[];
  availableCombinations?: GroupedCombination[];
  selectedTable: string | null;
  selectedCombinationId?: string | null;
  setSelectedTable: (tableId: string | null) => void;
  setSelectedCombinationId?: (combinationId: string | null) => void;
  viewMode?: 'visual' | 'list';
}

export function TableSelector({
  availableTables,
  availableCombinations = [],
  selectedTable,
  selectedCombinationId,
  setSelectedTable,
  setSelectedCombinationId,
  viewMode = 'visual'
}: TableSelectorProps) {
  const { toast } = useToast();
  // Toggle between visual and list view
  const [currentViewMode, setCurrentViewMode] = React.useState<'visual' | 'list'>(viewMode);

  const handleSelectTable = (tableId: string) => {
    setSelectedTable(tableId);
    if (setSelectedCombinationId) setSelectedCombinationId(null);
    
    const selectedTableInfo = (availableTables || []).find(table => table && table.id === tableId);
    
    if (selectedTableInfo) {
      toast({
        title: `Table ${selectedTableInfo.table_number} selected`,
        description: `Seats ${selectedTableInfo.capacity} people${selectedTableInfo.section ? ` in ${selectedTableInfo.section}` : ''}`,
        duration: 2000,
      });
    }
  };

  const handleSelectCombination = (combinationId: string) => {
    if (setSelectedCombinationId) {
      setSelectedCombinationId(combinationId);
      setSelectedTable(null);
      
      const selectedCombInfo = (availableCombinations || []).find(comb => comb && comb.id === combinationId);
      
      if (selectedCombInfo) {
        toast({
          title: `Table Combination selected`,
          description: `Combined capacity: ${selectedCombInfo.capacity} people`,
          duration: 2000,
        });
      }
    }
  };

  const handleViewModeChange = (mode: 'visual' | 'list') => {
    setCurrentViewMode(mode);
    toast({
      title: `View changed to ${mode} mode`,
      description: mode === 'visual' ? 'Visual floor plan view activated' : 'List view activated',
      duration: 1500,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Available Tables</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={currentViewMode === 'visual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('visual')}
          >
            <TableIcon className="h-4 w-4 mr-1" />
            Visual
          </Button>
          <Button
            variant={currentViewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
          >
            <Users className="h-4 w-4 mr-1" />
            List
          </Button>
        </div>
      </div>

      {currentViewMode === 'visual' ? (
        <VisualTableSelector
            availableTables={availableTables}
            availableCombinations={availableCombinations}
            selectedTable={selectedTable}
            selectedCombinationId={selectedCombinationId}
            onSelectTable={handleSelectTable}
            onSelectCombination={handleSelectCombination}
          />
      ) : (
        <TooltipProvider>
          <div className="space-y-4">
            {availableCombinations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground px-1">Table Combinations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableCombinations.map((comb) => (
                    <Card 
                      key={comb.id}
                      className={`cursor-pointer transition-all hover:border-primary border-dashed ${
                        selectedCombinationId === comb.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                      }`}
                      onClick={() => handleSelectCombination(comb.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Combined Table</p>
                              {comb.is_preferred && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Preferred</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Seats {comb.capacity} people
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uses {comb.table_ids.length} tables
                            </p>
                          </div>
                          {selectedCombinationId === comb.id && (
                            <div className="h-6 w-6 bg-primary rounded-full text-white flex items-center justify-center">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground px-1">Individual Tables</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(availableTables || []).filter(Boolean).map((table, index) => (
                  <Card 
                    key={table.id || `table-${table.table_number}-${index}`}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedTable === table.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleSelectTable(table.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Table {table.table_number}</p>
                          <p className="text-sm text-muted-foreground">
                            Seats {table.capacity} {table.capacity === 1 ? 'person' : 'people'}
                          </p>
                          {table.section && (
                            <p className="text-xs text-muted-foreground">{table.section}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Table details: {(table as any).attributes || (table as any).shape || 'Standard table'}</p>
                            </TooltipContent>
                          </Tooltip>
                          {selectedTable === table.id && (
                            <div className="h-6 w-6 bg-primary rounded-full text-white flex items-center justify-center">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
