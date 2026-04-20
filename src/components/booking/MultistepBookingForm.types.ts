import { Table, TableCombination } from '@/api/types';

export interface BookingState {
  step: number;
  date?: string;
  time: string;
  guests: string;
  specialRequests: string;
  selectedTable: string | null;
  selectedCombinationId: string | null;
  restaurantId: string;
}

export interface GroupedCombination {
  id: string;
  capacity: number;
  is_combination: boolean;
  table_ids: string[];
  is_preferred?: boolean;
}

export type AvailableTableResponse = Table & {
  combination_id?: string;
  is_preferred?: boolean;
};
