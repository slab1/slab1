
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/api/types';
import { Calendar, Clock, Users, Utensils, MessageSquare, CreditCard, MapPin } from 'lucide-react';
import { GroupedCombination } from './MultistepBookingForm.types';

interface ConfirmReservationStepProps {
  date: Date | undefined;
  time: string;
  guests: string;
  availableTables: Table[];
  availableCombinations?: GroupedCombination[];
  selectedTable: string | null;
  selectedCombinationId?: string | null;
  specialRequests: string;
  depositAmount: number;
  restaurantName: string;
  restaurantAddress?: string;
}

export const ConfirmReservationStep: React.FC<ConfirmReservationStepProps> = ({ 
  date, 
  time, 
  guests, 
  availableTables, 
  availableCombinations = [],
  selectedTable, 
  selectedCombinationId,
  specialRequests, 
  depositAmount, 
  restaurantName,
  restaurantAddress
}) => {
    const getTableName = (tableId: string | null, tables: Table[]): string => {
      if (selectedCombinationId) {
        const comb = availableCombinations.find(c => c.id === selectedCombinationId);
        if (comb) {
          return `Combined Tables (${comb.table_ids.length} tables, Capacity ${comb.capacity})`;
        }
      }
      
      const table = tables.find((t) => t.id === tableId);
      if (table) {
        return `Table ${table.table_number} (${table.section || 'Main Area'})`;
      }
      return 'Selected by Restaurant';
    };
    
    const formattedDate = date ? format(date, 'EEEE, MMMM dd, yyyy') : 'N/A';
    
    return (
        <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-1 flex items-center">
                    <Utensils className="mr-2 h-5 w-5 text-primary" />
                    {restaurantName}
                </h3>
                {restaurantAddress && (
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="mr-1 h-3 w-3" />
                        {restaurantAddress}
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-background p-2 rounded-md border shadow-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Date</p>
                            <p className="text-sm font-medium">{formattedDate}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="bg-background p-2 rounded-md border shadow-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Time</p>
                            <p className="text-sm font-medium">{time}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="bg-background p-2 rounded-md border shadow-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Party Size</p>
                            <p className="text-sm font-medium">{guests} {parseInt(guests) === 1 ? 'Guest' : 'Guests'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="bg-background p-2 rounded-md border shadow-sm">
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Table</p>
                            <p className="text-sm font-medium">{getTableName(selectedTable, availableTables)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {specialRequests && (
                <div className="bg-muted/30 p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                        <div className="bg-background p-2 rounded-md border shadow-sm mt-1">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Special Requests</p>
                            <p className="text-sm italic">"{specialRequests}"</p>
                        </div>
                    </div>
                </div>
            )}

            {depositAmount > 0 && (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-md">
                            <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-primary/80 uppercase font-semibold">Required Deposit</p>
                            <p className="text-sm font-bold text-primary">${depositAmount.toFixed(2)}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-background">Payment on next step</Badge>
                </div>
            )}
            
            <p className="text-xs text-muted-foreground text-center px-4">
                By confirming, you agree to our reservation terms and the restaurant's cancellation policy.
            </p>
        </div>
    );
};
