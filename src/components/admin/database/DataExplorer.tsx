import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Table as TableIcon,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/use-auth';
import { errorTracker } from '@/utils/error-tracking';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RecordForm } from './RecordForm';

// SECURITY: Whitelist of allowed tables for data explorer
// Tables containing sensitive data are blocked
const ALLOWED_TABLES = [
  'restaurants',
  'restaurant_locations', 
  'menu_items',
  'menu_categories',
  'reservations',
  'tables',
  'table_combinations',
  'special_events',
  'waitlist_entries',
  'reviews',
  'loyalty_programs',
  'loyalty_rewards',
  'loyalty_points_transactions',
  'audit_logs',
  'notifications',
  'payment_settings'
] as const;

// Tables that can only be read, not modified
const READONLY_TABLES = [
  'audit_logs',
  'profiles',
  'user_roles',
  'api_keys',
  'payments',
  'refunds'
] as const;

type AllowedTable = typeof ALLOWED_TABLES[number];
type ReadOnlyTable = typeof READONLY_TABLES[number];

const ALLOWED_TABLES_SET = new Set(ALLOWED_TABLES);
const READONLY_TABLES_SET = new Set(READONLY_TABLES);

function isAllowedTable(table: string): table is AllowedTable {
  return ALLOWED_TABLES_SET.has(table);
}

function isReadOnlyTable(table: string): table is ReadOnlyTable {
  return READONLY_TABLES_SET.has(table);
}

export function DataExplorer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<AllowedTable>('restaurants');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Authorization check - only admins can use data explorer
  const isAuthorized = user?.role === 'system_admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (!isAuthorized) {
      setAccessDenied(true);
      errorTracker.captureError(
        new Error('Unauthorized access to DataExplorer'),
        'warning',
        { userId: user?.id, role: user?.role }
      );
    }
  }, [isAuthorized, user]);

  // Fetch data from the selected table
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['table-data', selectedTable, page, pageSize],
    queryFn: async () => {
      // SECURITY: Validate table name against whitelist
      if (!isAllowedTable(selectedTable)) {
        throw new Error(`Table "${selectedTable}" is not accessible`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabase
        .from(selectedTable)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;
      return { rows: data || [], count: count || 0 };
    },
    enabled: isAuthorized && isAllowedTable(selectedTable)
  });

  // Delete record mutation - blocked for sensitive tables
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAuthorized) {
        throw new Error('Unauthorized');
      }

      // SECURITY: Block deletes on read-only tables
      if (isReadOnlyTable(selectedTable)) {
        throw new Error(`Deleting from ${selectedTable} is not allowed`);
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data: oldData } = await supabase
        .from(selectedTable)
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      const { error: auditError } = await supabase.from('audit_logs').insert([{
        table_name: selectedTable,
        action: 'DELETE',
        record_id: id,
        old_data: oldData,
        user_id: userId
      }]);
      
      if (auditError) {
        console.error('Failed to create audit log for delete:', auditError);
      }
    },
    onSuccess: () => {
      toast.success('Record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['table-data', selectedTable] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete record: ${error.message}`);
    }
  });

  // Save record mutation - blocked for sensitive tables
  const saveMutation = useMutation({
    mutationFn: async (formData: Record<string, unknown>) => {
      if (!isAuthorized) {
        throw new Error('Unauthorized');
      }

      // SECURITY: Block modifications on read-only tables
      if (isReadOnlyTable(selectedTable)) {
        throw new Error(`Modifying ${selectedTable} is not allowed`);
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (editingRecord) {
        const { error } = await supabase
          .from(selectedTable)
          .update(formData)
          .eq('id', editingRecord.id as string);
        
        if (error) throw error;

        const { error: auditError } = await supabase.from('audit_logs').insert([{
          table_name: selectedTable,
          action: 'UPDATE',
          record_id: editingRecord.id as string,
          old_data: editingRecord,
          new_data: formData,
          user_id: userId
        }]);
        
        if (auditError) {
          console.error('Failed to create audit log for update:', auditError);
        }
      } else {
        const { data, error } = await supabase
          .from(selectedTable)
          .insert(formData)
          .select()
          .single();
        
        if (error) throw error;

        const { error: auditError } = await supabase.from('audit_logs').insert([{
          table_name: selectedTable,
          action: 'INSERT',
          record_id: data?.id,
          new_data: data,
          user_id: userId
        }]);
        
        if (auditError) {
          console.error('Failed to create audit log for insert:', auditError);
        }
      }
    },
    onSuccess: () => {
      toast.success(editingRecord ? 'Record updated' : 'Record created');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['table-data', selectedTable] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save record: ${error.message}`);
    }
  });

  const columns = data?.rows.length ? Object.keys(data.rows[0]) : [];
  const canModify = !isReadOnlyTable(selectedTable);

  const handleAdd = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record: Record<string, unknown>) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // Access denied view
  if (accessDenied || !isAuthorized) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground max-w-md">
              You do not have permission to access the Data Explorer. 
              This feature is restricted to system administrators only.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center">
                <TableIcon className="h-5 w-5 mr-2" />
                Data Explorer
              </CardTitle>
              <CardDescription>
                Browse and manage records. Read-only access to sensitive tables.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTable} onValueChange={(v) => { setSelectedTable(v as AllowedTable); setPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_TABLES.map(table => (
                    <SelectItem key={table} value={table}>
                      <span className="flex items-center gap-2">
                        {table}
                        {isReadOnlyTable(table) && (
                          <Badge variant="outline" className="ml-2 text-xs">Read-only</Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {canModify && (
                <Button size="sm" onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={`Search in ${selectedTable}...`} 
                className="pl-8 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {columns.map(col => (
                      <TableHead key={col} className="font-mono text-xs font-bold uppercase tracking-wider">
                        {col}
                      </TableHead>
                    ))}
                    {canModify && <TableHead className="w-[80px] text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">Loading records...</p>
                      </TableCell>
                    </TableRow>
                  ) : data?.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                        <p className="text-muted-foreground italic">No records found in this table.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.rows.map((row: Record<string, unknown>, i: number) => (
                      <TableRow key={String(row.id) || i} className="hover:bg-accent/50 transition-colors">
                        {columns.map(col => (
                          <TableCell key={col} className="max-w-[200px] truncate font-mono text-xs">
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                          </TableCell>
                        ))}
                        {canModify && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(row)}>
                                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDelete(String(row.id))}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, data?.count || 0)}</span> of <span className="font-medium">{data?.count || 0}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="text-sm font-medium px-4">Page {page}</div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= (data?.count || 0)}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {canModify && (
        <RecordForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          tableName={selectedTable}
          record={editingRecord}
          columns={columns}
          onSave={(recordData) => saveMutation.mutate(recordData)}
          isSaving={saveMutation.isPending}
        />
      )}
    </div>
  );
}
