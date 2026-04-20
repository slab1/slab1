import { useState, useEffect, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Table } from '@/api/types';
import { GroupedCombination } from './MultistepBookingForm.types';

interface VisualTable extends Table {
  x?: number;
  y?: number;
}

// Fixed positions for a sample restaurant layout
const TABLE_POSITIONS: Record<string, { x: number; y: number }> = {
  '1': { x: 20, y: 20 },
  '2': { x: 80, y: 20 },
  '3': { x: 20, y: 80 },
  '4': { x: 80, y: 80 },
  '5': { x: 50, y: 50 },
  '6': { x: 20, y: 50 },
  '7': { x: 80, y: 50 },
  '8': { x: 50, y: 20 },
  '9': { x: 50, y: 80 },
  '10': { x: 35, y: 35 },
};

// Sample sections for restaurant
const SECTIONS = {
  'main': 'Main Dining',
  'window': 'Window View',
  'bar': 'Near Bar',
  'outdoor': 'Outdoor',
  'private': 'Private Room'
};

interface VisualTableSelectorProps {
  availableTables: Table[];
  availableCombinations?: GroupedCombination[];
  selectedTable: string | null;
  selectedCombinationId?: string | null;
  onSelectTable: (tableId: string) => void;
  onSelectCombination?: (combinationId: string) => void;
  className?: string;
}

export function VisualTableSelector({
  availableTables,
  availableCombinations = [],
  selectedTable,
  selectedCombinationId,
  onSelectTable,
  onSelectCombination,
  className
}: VisualTableSelectorProps) {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Enrich tables with positions and sections
  const enrichedTables = useMemo(() => {
    return (availableTables || [])
      .filter(table => table && table.id)
      .map(table => {
        const visualTable = table as VisualTable;
        // Ensure tableId is a string and handle potential missing values
        const tableId = String(visualTable.id || '');
        const tableNum = String(visualTable.table_number || '0');
        
        // Use predefined positions or default to semi-random positions within bounds
        // Use a seed-based approach to avoid re-randomizing on every render
        let position = TABLE_POSITIONS[tableNum];
        
        if (!position) {
          // Generate a semi-random but stable position based on table ID
          let seed = 0;
          for (let i = 0; i < tableId.length; i++) {
            seed = tableId.charCodeAt(i) + ((seed << 5) - seed);
          }
          
          const x = Math.abs(Math.sin(seed) * 80) + 10;
          const y = Math.abs(Math.cos(seed) * 80) + 10;
          position = { x, y };
        }

        visualTable.x = position.x;
        visualTable.y = position.y;
        return visualTable;
      });
  }, [availableTables]);

  const tables = enrichedTables;

  // Set initial section if we have tables
  useEffect(() => {
    if (tables.length > 0 && !selectedSection) {
      const availableSections = Array.from(new Set(tables.map(t => t.section).filter(Boolean)));
      if (availableSections.length > 0) {
        setSelectedSection(availableSections[0] as string);
      }
    }
    // Only run when tables change to set initial section if none selected
  }, [tables, selectedSection]);

  // Get unique sections from tables
  const sections = Array.from(new Set(tables.map(t => t.section).filter(Boolean)));

  // Filter tables by section if needed
  const filteredTables = selectedSection 
    ? tables.filter(table => table.section === selectedSection)
    : tables;

  // Get table IDs in selected combination
  const combinationTableIds = useMemo(() => {
    if (!selectedCombinationId || !availableCombinations) return [];
    const combination = availableCombinations.find(c => c.id === selectedCombinationId);
    return combination ? combination.table_ids : [];
  }, [selectedCombinationId, availableCombinations]);

  // Find which combination a table belongs to
  const getTableCombination = (tableId: string) => {
    return availableCombinations.find(c => c.table_ids.includes(tableId));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {sections.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="text-sm font-medium mr-2 flex items-center">Sections:</div>
          {sections.map(section => section && (
            <button
              key={section}
              type="button"
              className={cn(
                "px-3 py-1 text-sm rounded-full transition-colors",
                selectedSection === section 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80"
              )}
              onClick={() => setSelectedSection(section)}
            >
              {SECTIONS[section as keyof typeof SECTIONS] || section}
            </button>
          ))}
          {selectedSection && (
            <button
              type="button"
              className="px-2 py-1 text-sm rounded-full bg-muted hover:bg-muted/80 flex items-center"
              onClick={() => setSelectedSection(null)}
            >
              <X className="h-3 w-3 mr-1" /> All Sections
            </button>
          )}
        </div>
      )}
      
      <div className="relative h-[400px] w-full border border-border rounded-lg bg-muted/20 overflow-hidden z-0">
        {/* Restaurant Layout */}
        <div className="absolute inset-4 pointer-events-none">
          {/* Visual indications for restaurant features */}
          <div className="absolute top-0 left-0 h-full w-1 bg-primary/20 rounded"></div>
          <div className="absolute top-0 left-0 h-1 w-full bg-primary/20 rounded"></div>
          <div className="absolute top-0 right-0 h-full w-1 bg-primary/20 rounded"></div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/20 rounded"></div>
          
          {/* Entrance indication */}
          <div className="absolute bottom-5 left-[50%] -translate-x-[50%] h-10 w-24 bg-muted/60 rounded-t-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-x border-t border-border">
            Entrance
          </div>
          
          {/* Bar area indication */}
          <div className="absolute top-5 right-5 h-20 w-40 bg-muted/40 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
            Bar Area
          </div>
        </div>

        {/* Tables Container - This one allows pointer events */}
        <div className="absolute inset-4">
          {filteredTables.map((table, index) => {
            const tableId = table.id ? String(table.id) : `table-${table.table_number}-${index}`;
            const isSelected = table.id && String(table.id) === String(selectedTable);
            const isInSelectedCombination = table.id && combinationTableIds.includes(String(table.id));
            const tableComb = table.id ? getTableCombination(String(table.id)) : null;
            
            return (
              <div
                key={tableId}
                role="button"
                tabIndex={0}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 z-50 cursor-pointer flex items-center justify-center select-none active:scale-95 shadow-md",
                  table.capacity <= 2 ? "h-10 w-10" : 
                  table.capacity <= 4 ? "h-12 w-12" : 
                  table.capacity <= 6 ? "h-14 w-14" : "h-16 w-16",
                  isSelected || isInSelectedCombination
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" 
                    : "bg-card hover:bg-accent border border-border",
                  isInSelectedCombination && "ring-dashed ring-primary/40"
                )}
                style={{ 
                  left: `${table.x}%`, 
                  top: `${table.y}%` 
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('SELECTING TABLE:', tableId);
                  
                  if (tableComb && onSelectCombination) {
                    onSelectCombination(tableComb.id);
                  } else {
                    onSelectTable(tableId);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (tableComb && onSelectCombination) {
                      onSelectCombination(tableComb.id);
                    } else {
                      onSelectTable(tableId);
                    }
                  }
                }}
                title={tableComb 
                  ? `Part of Combination (Total Capacity: ${tableComb.capacity})` 
                  : `Table ${table.table_number} (Seats ${table.capacity})`
                }
              >
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold">#{table.table_number}</span>
                  {(isSelected || isInSelectedCombination) && <Check className="h-3 w-3 mt-0.5" />}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-background/80 rounded p-2 text-xs space-y-1 pointer-events-none">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-card border border-border mr-1"></div>
            <span>Available Table</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-primary mr-1"></div>
            <span>Selected Table</span>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground italic">
        Select a table on the map to reserve. Table size indicates seating capacity.
      </div>
    </div>
  );
}
