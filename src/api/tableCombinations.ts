import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';
import { TableCombination } from '@/api/types';
import { errorTracker } from '@/utils/error-tracking';

export const tableCombinationsApi = {
  // Get all table combinations for a location
  getByLocationId: async (locationId: string): Promise<TableCombination[]> => {
    try {
      if (!locationId) {
        errorTracker.captureError(
          new Error("getByLocationId called with empty locationId"),
          'warning',
          { context: 'get_table_combinations_by_location_validation' }
        );
        return [];
      }

      const { data, error } = await supabase
        .from('table_combinations')
        .select(`
          *,
          tables:table_ids (
            id,
            table_number,
            capacity,
            section
          )
        `)
        .eq('restaurant_location_id', locationId)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('name');

      if (error) throw error;
      return (data || []) as unknown as TableCombination[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_table_combinations_by_location',
        locationId
      });
      handleApiError(error);
      return [];
    }
  },

  // Get combination by ID
  getById: async (id: string): Promise<TableCombination | null> => {
    try {
      if (!id) {
        errorTracker.captureError(
          new Error("getById called with empty id"),
          'warning',
          { context: 'get_table_combination_by_id_validation' }
        );
        return null;
      }

      const { data, error } = await supabase
        .from('table_combinations')
        .select(`
          *,
          tables:table_ids (
            id,
            table_number,
            capacity,
            section
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as TableCombination | null;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_table_combination_by_id',
        combinationId: id
      });
      handleApiError(error);
      return null;
    }
  },

  // Create new table combination
  create: async (combination: Omit<TableCombination, 'id' | 'created_at' | 'updated_at'>): Promise<TableCombination | null> => {
    try {
      // Validate that all table_ids exist and belong to the same location
      if (combination.table_ids && combination.table_ids.length > 0) {
        const { data: tables, error: tableError } = await supabase
          .from('tables')
          .select('id, restaurant_location_id')
          .in('id', combination.table_ids);

        if (tableError) throw tableError;

        if (!tables || tables.length !== combination.table_ids.length) {
          throw new Error('Some tables do not exist');
        }

        // Check all tables belong to the same location
        const locationIds = [...new Set(tables.map(t => t.restaurant_location_id))];
        if (locationIds.length !== 1) {
          throw new Error('All tables in a combination must belong to the same location');
        }

        if (locationIds[0] !== combination.restaurant_location_id) {
          throw new Error('Tables do not belong to the specified restaurant location');
        }
      }

      const { data, error } = await supabase
        .from('table_combinations')
        .insert(combination as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TableCombination;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'create_table_combination',
        combination
      });
      handleApiError(error);
      return null;
    }
  },

  // Update table combination
  update: async (id: string, combination: Partial<TableCombination>): Promise<TableCombination | null> => {
    try {
      if (!id) {
        errorTracker.captureError(
          new Error("update called with empty id"),
          'warning',
          { context: 'update_table_combination_validation' }
        );
        return null;
      }

      // Validate table_ids if being updated
      if (combination.table_ids && combination.table_ids.length > 0) {
        const { data: tables, error: tableError } = await supabase
          .from('tables')
          .select('id, restaurant_location_id')
          .in('id', combination.table_ids);

        if (tableError) throw tableError;

        if (!tables || tables.length !== combination.table_ids.length) {
          throw new Error('Some tables do not exist');
        }

        // Check all tables belong to the same location
        const locationIds = [...new Set(tables.map(t => t.restaurant_location_id))];
        if (locationIds.length !== 1) {
          throw new Error('All tables in a combination must belong to the same location');
        }
      }

      const { data, error } = await supabase
        .from('table_combinations')
        .update({ ...combination, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TableCombination;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'update_table_combination',
        combinationId: id,
        combination
      });
      handleApiError(error);
      return null;
    }
  },

  // Delete table combination
  delete: async (id: string): Promise<boolean> => {
    try {
      if (!id) {
        errorTracker.captureError(
          new Error("delete called with empty id"),
          'warning',
          { context: 'delete_table_combination_validation' }
        );
        return false;
      }

      const { error } = await supabase
        .from('table_combinations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'delete_table_combination',
        combinationId: id
      });
      handleApiError(error);
      return false;
    }
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<boolean> => {
    try {
      if (!id) return false;

      // Get current status
      const { data: current, error: fetchError } = await supabase
        .from('table_combinations')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Toggle status
      const { error } = await supabase
        .from('table_combinations')
        .update({
          is_active: !current.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'toggle_table_combination_active',
        combinationId: id
      });
      handleApiError(error);
      return false;
    }
  },

  // Get combinations suitable for party size
  getForPartySize: async (locationId: string, partySize: number): Promise<TableCombination[]> => {
    try {
      if (!locationId || partySize <= 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('table_combinations')
        .select(`
          *,
          tables:table_ids (
            id,
            table_number,
            capacity,
            section
          )
        `)
        .eq('restaurant_location_id', locationId)
        .eq('is_active', true)
        .lte('min_party_size', partySize)
        .gte('max_party_size', partySize)
        .order('priority', { ascending: false })
        .order('max_party_size', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as TableCombination[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_table_combinations_for_party_size',
        locationId,
        partySize
      });
      handleApiError(error);
      return [];
    }
  },

  // Validate combination (check if tables are available and compatible)
  validateCombination: async (tableIds: string[], locationId: string): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const errors: string[] = [];

      if (!tableIds || tableIds.length === 0) {
        errors.push('No tables specified');
        return { valid: false, errors };
      }

      // Check all tables exist and belong to the location
      const { data: tables, error } = await supabase
        .from('tables')
        .select('id, table_number, capacity, restaurant_id')
        .in('id', tableIds) as { data: any[] | null; error: any };

      if (error) throw error;

      if (!tables || tables.length !== tableIds.length) {
        errors.push('Some tables do not exist');
        return { valid: false, errors };
      }

      // Check all tables belong to the specified restaurant
      const invalidTables = (tables as any[]).filter((t: any) => t.restaurant_id !== locationId);
      if (invalidTables.length > 0) {
        errors.push(`Tables ${invalidTables.map((t: any) => t.table_number).join(', ')} do not belong to this restaurant`);
      }

      // Check for duplicate tables in combination
      const uniqueIds = [...new Set(tableIds)];
      if (uniqueIds.length !== tableIds.length) {
        errors.push('Duplicate tables in combination');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'validate_table_combination',
        tableIds,
        locationId
      });
      handleApiError(error);
      return { valid: false, errors: ['Validation failed due to system error'] };
    }
  }
};
