
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Package, AlertTriangle, TrendingDown, Plus, Store } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { StockTransaction } from '@/api/stockTransactions';
import { InventoryList } from './InventoryList';
import { IngredientForm } from './IngredientForm';
import { StockTransactionForm } from './StockTransactionForm';
import { InventoryReports } from './InventoryReports';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface StockLevelItem {
  id: string;
  current_quantity: number;
  ingredient_id: string;
  unit_cost: number | null;
  restaurant_id: string;
  ingredients?: {
    reorder_threshold?: number;
  };
}

interface TransactionItem {
  id: string;
  transaction_type: string;
  quantity_change: number;
  created_at: string;
  restaurant_id: string;
  ingredients?: {
    name?: string;
  };
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

interface InventoryDashboardProps {
  restaurantId?: string;
}

export function InventoryDashboard({ restaurantId }: InventoryDashboardProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(restaurantId || null);

  // Update selectedRestaurantId when restaurantId prop changes
  useEffect(() => {
    if (restaurantId) {
      setSelectedRestaurantId(restaurantId);
    }
  }, [restaurantId]);

  const { data: managedRestaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['managed-restaurants', user?.id],
    queryFn: async (): Promise<{ id: string; name: string }[]> => {
      if (!user) return [];
      
      // 1. Try as owner - cast supabase to any to avoid type depth issues
      const { data: ownedData } = await (supabase as any)
        .from('restaurants')
        .select('id, name')
        .eq('admin_id', user.id);
      
      // 2. Try as staff
      const { data: staffData } = await (supabase as any)
        .from('restaurant_staff')
        .select('restaurant_id')
        .eq('user_id', user.id);
      
      // Fetch restaurant names for staff restaurants
      let staffRestaurants: { id: string; name: string }[] = [];
      if (staffData && staffData.length > 0) {
        const restaurantIds = staffData.map(s => s.restaurant_id);
        const { data: restaurantNames } = await (supabase as any)
          .from('restaurants')
          .select('id, name')
          .in('id', restaurantIds);
        staffRestaurants = (restaurantNames || []).map(r => ({ id: r.id, name: r.name }));
      }
      
      const restaurants = [
        ...(ownedData || []),
        ...staffRestaurants
      ];
      
      // Deduplicate by ID
      const uniqueRestaurants = Array.from(new Map(restaurants.map(r => [r.id, r])).values());
      
      return uniqueRestaurants;
    },
    enabled: !!user
  });

  // Set default restaurant
  useEffect(() => {
    if (managedRestaurants && managedRestaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(managedRestaurants[0].id);
    }
  }, [managedRestaurants, selectedRestaurantId]);

  // Get inventory statistics
  const { data: stats } = useQuery({
    queryKey: ['inventory-stats', selectedRestaurantId],
    queryFn: async () => {
      if (!selectedRestaurantId) return null;

      const { data: stockData, error: stockError } = await supabase
        .from('stock_levels')
        .select(`
          *,
          ingredients:ingredient_id (
            reorder_threshold
          )
        `)
        .eq('restaurant_id', selectedRestaurantId);

      if (stockError) throw stockError;

      const items = (stockData || []) as StockLevelItem[];
      const totalItems = items.length;
      const lowStockItems = items.filter(item => {
        const minimumLevel = item.ingredients?.reorder_threshold || 10;
        return item.current_quantity <= minimumLevel;
      }).length;

      const totalValue = items.reduce((sum, item) => {
        const cost = item.unit_cost || 0;
        return sum + (item.current_quantity * cost);
      }, 0);

      const criticalItems = items.filter(item => {
        const minimumLevel = item.ingredients?.reorder_threshold || 10;
        return item.current_quantity <= minimumLevel * 0.5;
      }).length;

      return {
        totalItems,
        lowStockItems,
        criticalItems,
        totalValue,
      };
    },
    enabled: !!selectedRestaurantId,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', selectedRestaurantId],
    queryFn: async () => {
      if (!selectedRestaurantId) return [];

      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          ingredients:ingredient_id (
            name
          ),
          profiles:created_by (
            first_name,
            last_name
          )
        `)
        .eq('restaurant_id', selectedRestaurantId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []) as unknown as StockTransaction[];
    },
    enabled: !!selectedRestaurantId,
  });

  if (loadingRestaurants) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
  }

  if (!selectedRestaurantId && !loadingRestaurants) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Store className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No restaurant found</h2>
        <p className="text-muted-foreground">You don't have access to any restaurant's inventory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track ingredients, manage stock levels, and monitor inventory health
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {managedRestaurants && managedRestaurants.length > 1 && (
            <div className="w-64">
              <Select value={selectedRestaurantId || ''} onValueChange={setSelectedRestaurantId}>
                <SelectTrigger>
                  <Store className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {managedRestaurants.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={() => setActiveTab('add-ingredient')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">Unique ingredients tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.lowStockItems || 0}</div>
            <p className="text-xs text-muted-foreground">Need restocking soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.criticalItems || 0}</div>
            <p className="text-xs text-muted-foreground">Immediate attention required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalValue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current inventory worth</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add-ingredient">Add Ingredient</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Manage your ingredient inventory and stock levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ingredients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="low-stock"
                    checked={showLowStockOnly}
                    onCheckedChange={setShowLowStockOnly}
                  />
                  <Label htmlFor="low-stock">Low stock only</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <InventoryList 
            searchTerm={searchTerm} 
            showLowStockOnly={showLowStockOnly} 
            restaurantId={selectedRestaurantId!}
          />

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest inventory movements and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions && recentTransactions.length > 0 ? (
                <div className="space-y-2">
                  {recentTransactions.map((transaction: StockTransaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{transaction.ingredients?.name || `Ingredient ID: ${transaction.ingredient_id}`}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.quantity_change > 0 ? '+' : ''}{transaction.quantity_change} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No recent transactions</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-ingredient">
          <Card>
            <CardHeader>
              <CardTitle>Add New Ingredient</CardTitle>
              <CardDescription>Add a new ingredient to your inventory system</CardDescription>
            </CardHeader>
            <CardContent>
              <IngredientForm restaurantId={selectedRestaurantId!} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Record Stock Transaction</CardTitle>
              <CardDescription>Add or remove stock quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <StockTransactionForm restaurantId={selectedRestaurantId!} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <InventoryReports restaurantId={selectedRestaurantId!} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
              <CardDescription>Configure inventory management preferences for this restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when ingredients fall below reorder thresholds
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-calculate Valuation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically update inventory value based on latest unit costs
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-4">Inventory Data Management</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" onClick={() => toast.info("Exporting inventory...")}>
                    <Package className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Importing functionality coming soon")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Import Ingredients
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Restaurant ID: <code className="bg-muted px-1 rounded">{selectedRestaurantId}</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
