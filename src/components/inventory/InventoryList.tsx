
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { inventoryApi, InventoryItem } from '@/api/inventory';
import { stockTransactionsApi, StockTransaction } from '@/api';
import { useToast } from '@/hooks/use-toast';

interface InventoryListProps {
  searchTerm?: string;
  showLowStockOnly?: boolean;
  restaurantId: string;
}

export function InventoryList({ searchTerm = '', showLowStockOnly = false, restaurantId }: InventoryListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent stock transactions
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['recent-stock-transactions', restaurantId],
    queryFn: async () => await stockTransactionsApi.getRecent(5, restaurantId),
  });

  const { data: inventoryItems, isLoading } = useQuery({
    queryKey: ['inventory-list', restaurantId, searchTerm, showLowStockOnly],
    queryFn: async () => {
      let items = await inventoryApi.getAll(restaurantId);

      if (showLowStockOnly) {
        items = items.filter(item => item.quantity <= (item.min_stock || 10));
      }

      // Sort by quantity ascending
      items.sort((a, b) => a.quantity - b.quantity);

      // Filter by search term on the frontend
      if (searchTerm) {
        items = items.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return items;
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: async (id: string) => {
      await inventoryApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-list', restaurantId] });
      toast({ title: 'Ingredient deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting ingredient',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-32">Loading inventory...</div>;
  }

  if (!inventoryItems || inventoryItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            {showLowStockOnly ? 'No low stock items found' : 'No inventory items found'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Inventory Items List */}
      {inventoryItems.map((item) => {
        const minimumLevel = item.min_stock || 10;
        const stockPercentage = minimumLevel > 0
          ? Math.min((item.quantity / minimumLevel) * 100, 100)
          : 100;
        const isLowStock = item.quantity <= minimumLevel;
        const isCritical = item.quantity <= minimumLevel * 0.5;

        return (
          <Card key={item.id} className={isCritical ? 'border-destructive' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <CardTitle className="text-lg">{item.name || 'Unknown Ingredient'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {item.category || 'No Category'} • {item.unit || 'units'}
                    </p>
                  </div>
                  {isLowStock && (
                    <Badge variant={isCritical ? 'destructive' : 'secondary'}>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {isCritical ? 'Critical' : 'Low Stock'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteIngredientMutation.mutate(item.id)}
                    disabled={deleteIngredientMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Current Stock</p>
                  <p className="text-2xl font-bold">{item.quantity || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Minimum Level</p>
                  <p className="text-lg">{minimumLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Unit Cost</p>
                  <p className="text-lg">${(item.unit_cost || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Value</p>
                  <p className="text-lg">${((item.quantity || 0) * (item.unit_cost || 0)).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stock Level</span>
                  <span>{stockPercentage.toFixed(0)}%</span>
                </div>
                <Progress
                  value={stockPercentage}
                  className={`h-2 ${isCritical ? 'bg-destructive/20' : ''}`}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground mt-3">
                <span>Last updated: {new Date(item.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
