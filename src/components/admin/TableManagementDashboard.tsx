import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table as TableIcon, Users, Settings, Plus, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import { Table, TableCombination } from '@/api/types';
import { tableApi } from '@/api/table';
import { tableCombinationsApi } from '@/api/tableCombinations';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TableManagementDashboardProps {
  restaurantId: string;
  locationId: string;
}

export function TableManagementDashboard({ restaurantId, locationId }: TableManagementDashboardProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [combinations, setCombinations] = useState<TableCombination[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<TableCombination | null>(null);

  const loadDataCallback = useCallback(async () => {
    setLoading(true);
    try {
      const [tablesData, combinationsData, statusData] = await Promise.all([
        tableApi.getByLocationId(locationId),
        tableCombinationsApi.getByLocationId(locationId),
        tableApi.getRealtimeStatus(locationId)
      ]);

      setTables(tablesData);
      setCombinations(combinationsData);
      setRealtimeStatus(statusData);
    } catch (error) {
      console.error('Error loading table data:', error);
      toast.error('Failed to load table data');
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  // Load data on mount
  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tablesData, combinationsData, statusData] = await Promise.all([
        tableApi.getByLocationId(locationId),
        tableCombinationsApi.getByLocationId(locationId),
        tableApi.getRealtimeStatus(locationId)
      ]);

      setTables(tablesData);
      setCombinations(combinationsData);
      setRealtimeStatus(statusData);
    } catch (error) {
      console.error('Error loading table data:', error);
      toast.error('Failed to load table data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tableId: string, status: string, reservationDate?: string, reservationTime?: string) => {
    try {
      const success = await tableApi.updateStatus(tableId, status, reservationDate, reservationTime);
      if (success) {
        toast.success('Table status updated');
        loadData(); // Refresh data
      }
    } catch (error) {
      toast.error('Failed to update table status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: 'default' as const, label: 'Available' },
      reserved: { variant: 'secondary' as const, label: 'Reserved' },
      occupied: { variant: 'destructive' as const, label: 'Occupied' },
      maintenance: { variant: 'outline' as const, label: 'Maintenance' },
      out_of_order: { variant: 'outline' as const, label: 'Out of Order' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Table Management</h2>
          <p className="text-muted-foreground">Manage tables, combinations, and real-time status</p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="combinations">Combinations</TabsTrigger>
          <TabsTrigger value="status">Real-time Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                <TableIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tables.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all sections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Table Combinations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{combinations.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active combinations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Now</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realtimeStatus.filter(s => s.current_status === 'available').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tables ready for reservations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Table
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Table</DialogTitle>
                    </DialogHeader>
                    {/* Table creation form would go here */}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => toast.info('Table combination creation form coming soon!')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Combination
                </Button>

                <Button variant="outline" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tables.map((table) => (
                  <div key={table.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Table {table.table_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {table.section} • Seats {table.capacity}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(table.is_available ? 'available' : 'out_of_order')}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info('Table status editing coming soon!')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combinations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Combinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {combinations.map((combo) => (
                  <div key={combo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Users className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{combo.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {combo.min_party_size}-{combo.max_party_size} people •
                          {combo.table_ids?.length || 0} tables
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {combo.is_preferred && <Badge variant="secondary">Preferred</Badge>}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Combination Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">Tables Included:</h4>
                              <div className="mt-2 space-y-1">
                                {combo.tables?.map((table: any) => (
                                  <div key={table.id} className="text-sm">
                                    Table {table.table_number} ({table.section}) - Seats {table.capacity}
                                  </div>
                                )) || 'Loading...'}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => tableCombinationsApi.toggleActive(combo.id).then(() => {
                          loadData();
                          toast.success('Combination status updated');
                        })}
                      >
                        {combo.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Table Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {realtimeStatus.map((status) => (
                  <div key={status.table_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Table {status.table_number}</h4>
                      {getStatusBadge(status.current_status)}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Section: {status.section}</p>
                      <p>Capacity: {status.capacity} seats</p>

                      {status.reservation_id && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <p className="font-medium">{status.customer_name}</p>
                          <p>Party of {status.party_size}</p>
                          {status.reservation_time && (
                            <p>Time: {status.reservation_time}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
