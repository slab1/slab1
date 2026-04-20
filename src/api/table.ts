
import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';
import { Table as TableType } from '@/api/types';
import { errorTracker } from '@/utils/error-tracking';

// Export the Table type for use in other files
export type Table = TableType;

export const tableApi = {
  getAll: async (): Promise<Table[]> => {
    try {
      // tables table doesn't have restaurant_location_id relation
      const { data, error } = await supabase
        .from('tables')
        .select('*');

      if (error) throw error;
      return (data || []) as unknown as Table[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_all_tables'
      });
      handleApiError(error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Table | null> => {
    try {
      if (!id) {
        errorTracker.captureError(
          new Error("getById called with empty id"),
          'warning',
          { context: 'get_table_by_id_validation' }
        );
        return null;
      }
      
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as Table | null;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_table_by_id',
        tableId: id
      });
      handleApiError(error);
      return null;
    }
  },
  
  getByLocationId: async (locationId: string): Promise<Table[]> => {
    try {
      if (!locationId) {
        errorTracker.captureError(
          new Error("getByLocationId called with empty locationId"),
          'warning',
          { context: 'get_tables_by_location_validation' }
        );
        return [];
      }

      const { data, error } = await supabase
        .from('tables')
        .select(`
          *,
          restaurant_location:restaurant_location_id (
            id,
            address,
            city,
            state,
            phone_number,
            restaurant:restaurant_id (
              id,
              name,
              cuisine
            )
          )
        `)
        .eq('restaurant_location_id', locationId);

      if (error) throw error;
      return (data || []) as unknown as Table[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_tables_by_location_id',
        locationId
      });
      handleApiError(error);
      return [];
    }
  },

  getByRestaurantId: async (restaurantId: string): Promise<Table[]> => {
    try {
      if (!restaurantId) {
        return [];
      }

      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      return (data || []) as unknown as Table[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_tables_by_restaurant_id',
        restaurantId
      });
      handleApiError(error);
      return [];
    }
  },
  
  getAvailableTables: async (
    location_id: string,
    reservation_date: string,
    reservation_time: string,
    party_size: number
  ) => {
    try {
      const { data, error } = await supabase.rpc('get_available_tables' as any, {
        p_location_id: location_id,
        p_reservation_date: reservation_date,
        p_reservation_time: reservation_time,
        p_party_size: party_size,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_available_tables',
        location_id,
        reservation_date,
        reservation_time,
        party_size
      });
      handleApiError(error);
      return [];
    }
  },

  // Enhanced availability checking with combinations
  getAvailableTablesEnhanced: async (
    locationId: string,
    reservationDate: string,
    reservationTime: string,
    partySize: number,
    durationMinutes: number = 90
  ) => {
    try {
      const { data, error } = await supabase.rpc('get_available_tables_enhanced', {
        p_location_id: locationId,
        p_reservation_date: reservationDate,
        p_reservation_time: reservationTime,
        p_party_size: partySize,
        p_duration_minutes: durationMinutes,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_available_tables_enhanced',
        locationId,
        reservationDate,
        reservationTime,
        partySize,
        durationMinutes
      });
      handleApiError(error);
      return [];
    }
  },

  // Get real-time table status for a location
  getRealtimeStatus: async (locationId: string, date?: string) => {
    try {
      const { data, error } = await supabase.rpc('get_table_status_realtime' as any, {
        p_location_id: locationId,
        p_date: date || new Date().toISOString().split('T')[0],
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_table_realtime_status',
        locationId,
        date
      });
      handleApiError(error);
      return [];
    }
  },

  // Update table status
  updateStatus: async (
    tableId: string,
    status: string,
    reservationDate?: string,
    reservationTime?: string,
    reservationId?: string,
    notes?: string,
    changeReason?: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('update_table_status', {
        p_table_id: tableId,
        p_new_status: status,
        p_reservation_date: reservationDate,
        p_reservation_time: reservationTime,
        p_reservation_id: reservationId,
        p_changed_by: (await supabase.auth.getUser()).data.user?.id,
        p_notes: notes,
        p_change_reason: changeReason,
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'update_table_status',
        tableId,
        status,
        reservationDate,
        reservationTime
      });
      handleApiError(error);
      return false;
    }
  },

  // Optimize table assignments for party size
  optimizeAssignments: async (
    locationId: string,
    partySize: number,
    preferredSection?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('optimize_table_assignments', {
        p_location_id: locationId,
        p_party_size: partySize,
        p_preferred_section: preferredSection,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'optimize_table_assignments',
        locationId,
        partySize,
        preferredSection
      });
      handleApiError(error);
      return [];
    }
  },
  
  create: async (table: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table | null> => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .insert(table as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Table;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'create_table',
        table
      });
      handleApiError(error);
      return null;
    }
  },
  
  update: async (id: string, table: Partial<Table>): Promise<Table | null> => {
    try {
      if (!id) {
        errorTracker.captureError(
          new Error("update called with empty id"),
          'warning',
          { context: 'update_table_validation' }
        );
        return null;
      }
      
      const { data, error } = await supabase
        .from('tables')
        .update(table as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Table;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'update_table',
        tableId: id
      });
      handleApiError(error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      if (!id) {
        errorTracker.captureError(
          new Error("delete called with empty id"),
          'warning',
          { context: 'delete_table_validation' }
        );
        return false;
      }
      
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'delete_table',
        tableId: id
      });
      handleApiError(error);
      return false;
    }
  }
};
