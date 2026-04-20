import React, { useState } from 'react';
import { 
  Table as TableIcon, 
  Columns, 
  Key, 
  Link as LinkIcon, 
  Search,
  ChevronRight,
  ChevronDown,
  Database,
  Activity,
  Shield,
  FileCode,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableEditor } from './TableEditor';
import { toast } from 'sonner';

export function SchemaBrowser() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
  const [activeObjectType, setActiveObjectType] = useState<'tables' | 'procedures' | 'functions'>('tables');

  const [selectedObjectName, setSelectedObjectName] = useState<string | null>(null);

  // Schema fetch mutation (we'll use this for real data later)
  const executeSqlMutation = useMutation({
    mutationFn: async (sql: string) => {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Schema updated successfully');
      setIsTableEditorOpen(false);
      queryClient.invalidateQueries({ queryKey: ['database-schema'] });
    },
    onError: (error: any) => {
      toast.error(`Schema update failed: ${error.message}`);
    }
  });

  // Dynamic schema discovery
  const { data: schemaData, isLoading } = useQuery({
    queryKey: ['database-schema'],
    queryFn: async () => {
      try {
        // Try to fetch real schema info if exec_sql exists
        const { data: tablesData, error: tablesError } = await supabase.rpc('exec_sql', { 
          sql_query: `
            SELECT 
              t.table_name as name,
              (SELECT description FROM pg_description WHERE objoid = ('public.' || t.table_name)::regclass AND objsubid = 0) as description,
              jsonb_agg(jsonb_build_object(
                'name', c.column_name,
                'type', c.data_type,
                'isPrimary', (
                  SELECT EXISTS (
                    SELECT 1 FROM information_schema.key_column_usage kcu
                    JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
                    WHERE kcu.table_name = t.table_name AND kcu.column_name = c.column_name AND tc.constraint_type = 'PRIMARY KEY'
                  )
                ),
                'isNullable', c.is_nullable = 'YES'
              )) as columns
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
            GROUP BY t.table_name;
          `
        });

        if (tablesError) throw tablesError;
        
        return {
          tables: (tablesData as any[]).map(t => ({
            ...t,
            relationships: [] // Relationships would need more complex SQL
          })),
          procedures: [],
          functions: []
        };
      } catch (e) {
        // Fallback to mock data if RPC fails
        return {
          tables: [
            {
              name: 'restaurants',
              description: 'Core table for restaurant information',
              columns: [
                { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
                { name: 'name', type: 'text', isPrimary: false, isNullable: false },
                { name: 'address', type: 'text', isPrimary: false, isNullable: true },
                { name: 'phone', type: 'text', isPrimary: false, isNullable: true },
                { name: 'created_at', type: 'timestamp with time zone', isPrimary: false, isNullable: true },
              ],
              relationships: [
                { column: 'id', references: 'menu_categories.restaurant_id', type: 'One-to-Many' }
              ]
            },
            {
              name: 'menu_items',
              description: 'Individual dishes and products',
              columns: [
                { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
                { name: 'category_id', type: 'uuid', isPrimary: false, isNullable: false },
                { name: 'name', type: 'text', isPrimary: false, isNullable: false },
                { name: 'price', type: 'numeric', isPrimary: false, isNullable: false },
                { name: 'is_available', type: 'boolean', isPrimary: false, isNullable: false, default: 'true' },
              ],
              relationships: [
                { column: 'category_id', references: 'menu_categories.id', type: 'Many-to-One' }
              ]
            },
            {
              name: 'audit_logs',
              description: 'System-wide activity logging',
              columns: [
                { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
                { name: 'table_name', type: 'text', isPrimary: false, isNullable: false },
                { name: 'action', type: 'text', isPrimary: false, isNullable: false },
                { name: 'old_values', type: 'jsonb', isPrimary: false, isNullable: true },
                { name: 'new_values', type: 'jsonb', isPrimary: false, isNullable: true },
                { name: 'user_id', type: 'uuid', isPrimary: false, isNullable: true },
              ],
              relationships: []
            }
          ],
          functions: [
            { name: 'calculate_restaurant_rating', args: 'p_restaurant_id uuid', returns: 'numeric' },
            { name: 'check_table_availability', args: 'p_restaurant_id uuid, p_date date', returns: 'boolean' }
          ],
          procedures: [
            { name: 'cleanup_audit_logs', args: 'retention_days integer' }
          ]
        };
      }
    }
  });

  const filteredObjects = activeObjectType === 'tables' 
    ? schemaData?.tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : activeObjectType === 'procedures'
    ? schemaData?.procedures.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : schemaData?.functions.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const selectedObject = activeObjectType === 'tables'
    ? schemaData?.tables.find(t => t.name === selectedObjectName) || schemaData?.tables[0]
    : activeObjectType === 'procedures'
    ? schemaData?.procedures.find(p => p.name === selectedObjectName) || schemaData?.procedures[0]
    : schemaData?.functions.find(f => f.name === selectedObjectName) || schemaData?.functions[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-1 h-[calc(100vh-250px)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Objects</CardTitle>
            <div className="flex gap-1">
              <Button 
                variant={activeObjectType === 'tables' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 text-[10px]"
                onClick={() => setActiveObjectType('tables')}
              >
                Tables
              </Button>
              <Button 
                variant={activeObjectType === 'procedures' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 text-[10px]"
                onClick={() => setActiveObjectType('procedures')}
              >
                Procedures
              </Button>
              <Button 
                variant={activeObjectType === 'functions' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 text-[10px]"
                onClick={() => setActiveObjectType('functions')}
              >
                Functions
              </Button>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsTableEditorOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter tables..." 
              className="pl-8 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-380px)] px-4">
            <div className="space-y-1 py-4">
              {filteredObjects?.map((obj) => (
                <button
                  key={obj.name}
                  onClick={() => setSelectedObjectName(obj.name)}
                  className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors flex items-center justify-between group ${
                    selectedObjectName === obj.name || (!selectedObjectName && filteredObjects[0]?.name === obj.name)
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <div className="flex items-center truncate">
                    {activeObjectType === 'tables' ? <TableIcon className="h-3 w-3 mr-2" /> : <FileCode className="h-3 w-3 mr-2" />}
                    <span className="truncate">{obj.name}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 space-y-6">
        {selectedObject ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    {activeObjectType === 'tables' ? <TableIcon className="h-6 w-6 mr-2 text-primary" /> : <FileCode className="h-6 w-6 mr-2 text-primary" />}
                    {selectedObject.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedObject.description || `Database ${activeObjectType.slice(0, -1)}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">public</Badge>
                  <Badge variant="secondary">{activeObjectType.slice(0, -1)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeObjectType === 'tables' ? (
                <Accordion type="single" collapsible defaultValue="columns" className="w-full">
                  <AccordionItem value="columns">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <Columns className="h-4 w-4 mr-2" />
                        Columns ({(selectedObject as any).columns.length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-md border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2 font-medium">Name</th>
                              <th className="text-left p-2 font-medium">Type</th>
                              <th className="text-left p-2 font-medium">Attributes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {(selectedObject as any).columns.map((col: any) => (
                              <tr key={col.name}>
                                <td className="p-2 font-mono text-xs">{col.name}</td>
                                <td className="p-2 text-xs text-muted-foreground">{col.type}</td>
                                <td className="p-2">
                                  <div className="flex gap-1">
                                    {col.isPrimary && <Badge className="text-[10px] h-4">PK</Badge>}
                                    {!col.isNullable && <Badge variant="outline" className="text-[10px] h-4">Not Null</Badge>}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md font-mono text-sm whitespace-pre">
                    {activeObjectType === 'functions' ? (
                      `CREATE OR REPLACE FUNCTION ${selectedObject.name}(${(selectedObject as any).args || ''})\nRETURNS ${(selectedObject as any).returns || 'void'} AS $$\nBEGIN\n  -- Function body\nEND;\n$$ LANGUAGE plpgsql;`
                    ) : (
                      `CREATE OR REPLACE PROCEDURE ${selectedObject.name}(${(selectedObject as any).args || ''})\nAS $$\nBEGIN\n  -- Procedure body\nEND;\n$$ LANGUAGE plpgsql;`
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
            <Database className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a database object to view details</p>
          </div>
        )}
      </div>

      <TableEditor
        open={isTableEditorOpen}
        onClose={() => setIsTableEditorOpen(false)}
        onSave={(sql) => executeSqlMutation.mutate(sql)}
      />
    </div>
  );
}
