import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Table, Code, Share2, History, Shield, Settings } from 'lucide-react';
import { SchemaBrowser } from './SchemaBrowser';
import { DataExplorer } from './DataExplorer';
import { SqlEditor } from './SqlEditor';
import { VisualRelationship } from './VisualRelationship';
import { BackupStrategy } from './BackupStrategy';
import { AuditLogsTable } from '../AuditLogsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function DatabaseManager() {
  const [activeTab, setActiveTab] = useState('setup');

  const { data: health, isLoading: isCheckingHealth } = useQuery({
    queryKey: ['db-health'],
    queryFn: async () => {
      const results = {
        exec_sql: false,
        tables: false,
        rls: false,
        connection: false
      };

      try {
        // Check connection (try to fetch something that always exists or just ping)
        const { data: pingData, error: pingError } = await supabase.from('restaurants').select('count', { count: 'exact', head: true });
        results.connection = true; // If we reached here, Supabase client is configured
        
        if (pingError) {
          if (pingError.code === 'PGRST116' || pingError.code === '42P01') {
            // Table doesn't exist, but connection is likely fine
            results.tables = false;
          } else {
            results.connection = false;
          }
        } else {
          results.tables = true;
        }

        // Check exec_sql
        const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' });
        results.exec_sql = !rpcError;

        return results;
      } catch (e) {
        return results;
      }
    }
  });

  // Automatically switch to appropriate tab based on health
  React.useEffect(() => {
    if (health) {
      if (!health.connection || !health.exec_sql || !health.tables) {
        setActiveTab('setup');
      }
    }
  }, [health]);

  if (isCheckingHealth && !health) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Running system diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Database Management System</h2>
          <p className="text-muted-foreground">
            Comprehensive tools for schema management, data operations, and database auditing.
          </p>
        </div>
        
        {health && (!health.exec_sql || !health.tables) && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setActiveTab('setup')}
            className="animate-pulse"
          >
            <Shield className="h-4 w-4 mr-2" />
            Fix Setup Errors
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 bg-transparent h-auto p-0">
          <TabsTrigger value="setup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="schema" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Table className="h-4 w-4 mr-2" />
            Schema
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
          <TabsTrigger value="sql" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Code className="h-4 w-4 mr-2" />
            SQL Editor
          </TabsTrigger>
          <TabsTrigger value="design" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Share2 className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="h-4 w-4 mr-2" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schema" className="space-y-4">
          <SchemaBrowser />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <DataExplorer />
        </TabsContent>

        <TabsContent value="sql" className="space-y-4">
          <SqlEditor />
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <VisualRelationship />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Audit Logs</CardTitle>
              <CardDescription>Monitor all changes and operations performed on the database.</CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <BackupStrategy />
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Diagnostic & Setup</CardTitle>
              <CardDescription>Ensure your database is correctly configured for all administrative features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className={`p-4 rounded-lg border flex items-center justify-between ${health?.connection ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center gap-3">
                    <Database className={`h-5 w-5 ${health?.connection ? 'text-green-500' : 'text-red-500'}`} />
                    <div>
                      <p className="font-semibold text-sm">Supabase Connection</p>
                      <p className="text-xs text-muted-foreground">{health?.connection ? 'Connected' : 'Connection Failed'}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border flex items-center justify-between ${health?.exec_sql ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                  <div className="flex items-center gap-3">
                    <Code className={`h-5 w-5 ${health?.exec_sql ? 'text-green-500' : 'text-yellow-500'}`} />
                    <div>
                      <p className="font-semibold text-sm">RPC Function (exec_sql)</p>
                      <p className="text-xs text-muted-foreground">{health?.exec_sql ? 'Installed' : 'Missing'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {!health?.exec_sql && (
                <Alert variant="destructive" className="bg-yellow-500/5 border-yellow-500/20">
                  <Shield className="h-4 w-4 text-yellow-500" />
                  <AlertTitle className="text-yellow-700">Missing exec_sql Function</AlertTitle>
                  <AlertDescription className="text-yellow-600/80">
                    The SQL Editor and Schema Browser require a special RPC function to execute queries safely.
                    Please run the following SQL in your Supabase Dashboard SQL Editor:
                  </AlertDescription>
                  <pre className="mt-4 p-4 bg-black/80 text-white rounded-md text-[10px] overflow-x-auto">
{`CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 AS $$
 DECLARE
   result jsonb;
 BEGIN
   IF sql_query ILIKE 'SELECT%' OR sql_query ILIKE 'WITH%' THEN
     EXECUTE 'SELECT jsonb_agg(t) FROM (' || sql_query || ') t' INTO result;
   ELSE
     EXECUTE sql_query;
     result := '{"status": "success"}'::jsonb;
   END IF;
   RETURN result;
 END;
 $$;`}
                  </pre>
                </Alert>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Recommended Initial Tables</h4>
                <p className="text-xs text-muted-foreground">If you are starting from scratch, run these to create the core system tables.</p>
                <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
                  <p className="text-[10px] font-mono whitespace-pre overflow-x-auto">
{`CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
