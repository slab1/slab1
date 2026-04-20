import React, { useState } from 'react';
import { 
  Play, 
  Trash2, 
  Save, 
  FileCode, 
  Terminal, 
  History,
  AlertTriangle,
  CheckCircle2,
  Table as TableIcon,
  Download,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function SqlEditor() {
  const [sql, setSql] = useState('-- Type your SQL query here\nSELECT * FROM restaurants LIMIT 10;');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  
  // Query Builder State
  const [qbTable, setQbTable] = useState('restaurants');
  const [qbColumns, setQbColumns] = useState('*');
  const [qbLimit, setQbLimit] = useState('10');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportToCsv = () => {
    if (!results || !Array.isArray(results) || results.length === 0) return;
    
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `query_results_${new Date().getTime()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Results exported to CSV');
  };

  const generateFromBuilder = () => {
    const generatedSql = `SELECT ${qbColumns} FROM ${qbTable} LIMIT ${qbLimit};`;
    setSql(generatedSql);
    setActiveTab('editor');
    toast.success('SQL generated from builder');
  };

  const executeSql = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // In a real comprehensive system, we'd call a secure RPC like 'exec_sql'
      // For this demo/setup, we'll try a common pattern or show an error if not found
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        if (error.message.includes('function "exec_sql" does not exist')) {
          throw new Error('The "exec_sql" RPC function is not installed. Please create it in your Supabase SQL Editor to enable this feature.');
        }
        throw error;
      }

      setResults(Array.isArray(data) ? data : (data ? [data] : []));
      setHistory(prev => [sql, ...prev].slice(0, 10));
      toast.success('Query executed successfully');
    } catch (err: any) {
      console.error('SQL Execution Error:', err);
      setError(err.message);
      toast.error('Query execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearEditor = () => setSql('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'editor' ? 'secondary' : 'ghost'} 
              onClick={() => setActiveTab('editor')}
              size="sm"
            >
              SQL Editor
            </Button>
            <Button 
              variant={activeTab === 'builder' ? 'secondary' : 'ghost'} 
              onClick={() => setActiveTab('builder')}
              size="sm"
            >
              Query Builder
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearEditor}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear
            </Button>
            <Button size="sm" onClick={executeSql} disabled={isLoading || !sql.trim()}>
              <Play className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Run Query
            </Button>
          </div>
        </div>

        <Card className="min-h-[400px]">
          <CardContent className="p-0">
            {activeTab === 'editor' ? (
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                className="w-full h-[400px] p-4 font-mono text-sm bg-muted/30 focus:outline-none resize-none"
                placeholder="SELECT * FROM table_name..."
              />
            ) : (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Table</Label>
                    <Input 
                      value={qbTable}
                      onChange={(e) => setQbTable(e.target.value)}
                      placeholder="table_name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Columns (comma separated)</Label>
                    <Input 
                      value={qbColumns}
                      onChange={(e) => setQbColumns(e.target.value)}
                      placeholder="*, id, name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limit</Label>
                    <Input 
                      type="number"
                      value={qbLimit}
                      onChange={(e) => setQbLimit(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={generateFromBuilder} className="w-full">
                  Generate SQL & Switch to Editor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="font-mono text-xs">
              {error}
            </AlertDescription>
            {error.includes('exec_sql') && (
              <div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                <p className="text-xs mb-1">To enable this, run this SQL in Supabase Dashboard:</p>
                <pre className="text-[10px] bg-black/20 p-2 rounded overflow-x-auto">
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
              </div>
            )}
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <TableIcon className="h-5 w-5 mr-2" />
                Query Results
              </CardTitle>
              <div className="flex items-center gap-2">
                {results && Array.isArray(results) && results.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToCsv}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </>
                )}
                {results && Array.isArray(results) && (
                  <Badge variant="secondary">
                    {results.length} rows returned
                  </Badge>
                )}
                {results && !Array.isArray(results) && (
                  <Badge variant="secondary">
                    Success
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        {results.length > 0 && Object.keys(results[0]).map(key => (
                          <TableHead key={key} className="font-mono text-xs font-bold whitespace-nowrap">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((row, i) => (
                        <TableRow key={i} className="hover:bg-accent/50 transition-colors">
                          {Object.values(row).map((val: any, j) => (
                            <TableCell key={j} className="font-mono text-xs whitespace-nowrap truncate max-w-[200px]">
                              {val === null ? <span className="text-muted-foreground italic">null</span> : 
                               typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {results.length === 0 && (
                        <TableRow>
                          <TableCell className="h-24 text-center" colSpan={100}>
                            <p className="text-muted-foreground italic">Query returned no rows.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-xl bg-accent/5">
                <p className="text-muted-foreground text-sm italic">Run a query to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <History className="h-5 w-5 mr-2" />
              Query History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {history.length > 0 ? history.map((h, i) => (
                  <div key={i} className="group p-3 rounded-lg border bg-muted/30 hover:bg-accent transition-colors cursor-pointer" onClick={() => setSql(h)}>
                    <p className="font-mono text-[10px] line-clamp-3 text-muted-foreground group-hover:text-foreground">
                      {h}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-[10px]">SUCCESS</Badge>
                      <FileCode className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-8 italic">No query history yet.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
