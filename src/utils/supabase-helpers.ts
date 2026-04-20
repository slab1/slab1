/**
 * Supabase Helper Functions
 * 
 * Centralized utilities for dynamic database operations
 * that require type flexibility.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

/**
 * Get a query builder for a dynamic table by name.
 * Use this for admin tools that need to query arbitrary tables.
 * 
 * @param tableName - The name of the table to query
 * @param selectQuery - Optional select query string
 */
export function getDynamicTableQuery(tableName: string, selectQuery: string = '*') {
  // This is the ONE place we use 'as any' for dynamic table names
  return (supabase as any).from(tableName).select(selectQuery);
}

/**
 * Insert into a dynamic table by name.
 */
export function insertDynamicTable(
  tableName: string,
  data: Record<string, unknown> | Record<string, unknown>[]
) {
  const insertData = Array.isArray(data) ? data : [data];
  return (supabase as any).from(tableName).insert(insertData);
}

/**
 * Update a dynamic table by name.
 */
export function updateDynamicTable(
  tableName: string,
  data: Record<string, unknown>,
  match: { column: string; value: unknown }
) {
  return (supabase as any)
    .from(tableName)
    .update(data)
    .eq(match.column, match.value);
}

/**
 * Delete from a dynamic table by name.
 */
export function deleteDynamicTable(
  tableName: string,
  match: { column: string; value: unknown }
) {
  return (supabase as any)
    .from(tableName)
    .delete()
    .eq(match.column, match.value);
}

/**
 * Execute a raw SQL query using the exec_sql RPC function.
 * Only available to admins with proper permissions.
 */
export async function executeRawSql(sqlQuery: string): Promise<{
  data: Json[] | null;
  error: Error | null;
}> {
  const { data, error } = await (supabase as any).rpc('exec_sql', {
    sql_query: sqlQuery
  });

  return { data, error };
}
