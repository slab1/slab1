import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, History, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { format } from "date-fns";

export function AuditLogsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const filteredLogs = logs?.filter(log => 
    log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.record_id?.includes(searchTerm)
  ) || [];

  const getActionColor = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'INSERT': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              Track all administrative changes across the platform
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Timestamp</TableHead>
                <TableHead className="min-w-[120px]">Table</TableHead>
                <TableHead className="min-w-[100px]">Action</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[150px]">Record ID</TableHead>
                <TableHead className="hidden md:table-cell min-w-[150px]">User ID</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit logs found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono">
                      {format(new Date(log.created_at || new Date()), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {log.table_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${getActionColor(log.action)}`}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs font-mono">
                      {log.record_id?.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono">
                      {log.user_id?.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                            <DialogDescription>
                              Full record of the {log.action.toLowerCase()} action on {log.table_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-semibold">Timestamp</p>
                                <p className="text-muted-foreground">{format(new Date(log.created_at), "PPPPpppp")}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Action</p>
                                <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                              </div>
                              <div>
                                <p className="font-semibold">Table</p>
                                <p className="font-mono">{log.table_name}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Record ID</p>
                                <p className="font-mono text-xs">{log.record_id}</p>
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold mb-2">Payload Details</p>
                              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-[10px] md:text-xs">
                                {JSON.stringify(log.old_data || log.new_data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
