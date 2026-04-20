
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TransactionData {
  id: string;
  ingredient_id: string;
  quantity_change: number;
  unit_cost?: number;
  ingredients?: {
    name?: string;
    category?: string;
    unit?: string;
  };
}

interface StockLevelData {
  id: string;
  current_quantity: number;
  unit_cost?: number;
  ingredients?: {
    name?: string;
    category?: string;
    unit?: string;
  };
}

interface InventoryReportsProps {
  restaurantId: string;
}

export function InventoryReports({ restaurantId }: InventoryReportsProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [reportType, setReportType] = useState('usage');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['inventory-reports', reportType, dateRange, restaurantId],
    queryFn: async () => {
      const { from, to } = dateRange;
      if (!from || !to) return null;

      switch (reportType) {
        case 'usage':
          return await getUsageReport(from, to, restaurantId);
        case 'valuation':
          return await getValuationReport(restaurantId);
        case 'trends':
          return await getTrendsReport(from, to, restaurantId);
        default:
          return null;
      }
    },
    enabled: !!dateRange.from && !!dateRange.to && !!restaurantId,
  });

  const exportReport = () => {
    if (!reportData) return;

    const csvContent = convertToCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `inventory-${reportType}-report.csv`);
    a.click();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Reports</h2>
          <p className="text-muted-foreground">Analyze inventory performance and trends</p>
        </div>
        <Button onClick={exportReport} disabled={!reportData}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage">Usage Analysis</SelectItem>
                  <SelectItem value="valuation">Stock Valuation</SelectItem>
                  <SelectItem value="trends">Trend Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <DatePicker
                date={dateRange.from}
                onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <DatePicker
                date={dateRange.to}
                onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportType === 'usage' && reportData && <UsageReport data={reportData} />}
      {reportType === 'valuation' && reportData && <ValuationReport data={reportData} />}
      {reportType === 'trends' && reportData && <TrendsReport data={reportData} />}
    </div>
  );
}

function UsageReport({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Most Used Ingredients</CardTitle>
          <CardDescription>Top ingredients by consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topUsed?.map((item: any, index: number) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.totalUsed} {item.unit}</p>
                  <p className="text-sm text-muted-foreground">${item.totalValue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>Daily usage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalUsage" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ValuationReport({ data }: { data: any }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Stock Valuation</CardTitle>
          <CardDescription>Total inventory value: ${data.totalValue?.toFixed(2)}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoryValue}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.categoryValue?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>High Value Items</CardTitle>
          <CardDescription>Most valuable inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.highValueItems?.map((item: any, index: number) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} @ ${item.unitCost}/unit
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.totalValue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendsReport({ data }: { data: any }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Level Trends</CardTitle>
          <CardDescription>Track inventory levels over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.stockTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {data.ingredients?.map((ingredient: any, index: number) => (
                <Line
                  key={ingredient}
                  type="monotone"
                  dataKey={ingredient}
                  stroke={COLORS[index % COLORS.length]}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Stock Turnover</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageTurnover?.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">
              {data.turnoverTrend > 0 ? '+' : ''}{data.turnoverTrend?.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Outs</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stockOuts || 0}</div>
            <p className="text-xs text-muted-foreground">Items that ran out of stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Frequency</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.reorderFrequency?.toFixed(1)}/week</div>
            <p className="text-xs text-muted-foreground">Average reorders per week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions for data fetching
async function getUsageReport(from: Date, to: Date, restaurantId: string) {
  const { data } = await supabase
    .from('stock_transactions')
    .select(`
      *,
      ingredients:ingredient_id (name, category, unit)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('transaction_type', 'out')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString());

  const transactions = (data || []) as TransactionData[];
  
  const topUsed = transactions
    .reduce((acc: any[], transaction) => {
      const existing = acc.find(item => item.id === transaction.ingredient_id);
      if (existing) {
        existing.totalUsed += Math.abs(transaction.quantity_change);
        existing.totalValue += Math.abs(transaction.quantity_change) * (transaction.unit_cost || 0);
      } else {
        acc.push({
          id: transaction.ingredient_id,
          name: transaction.ingredients?.name,
          category: transaction.ingredients?.category,
          unit: transaction.ingredients?.unit,
          totalUsed: Math.abs(transaction.quantity_change),
          totalValue: Math.abs(transaction.quantity_change) * (transaction.unit_cost || 0),
        });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => b.totalUsed - a.totalUsed)
    .slice(0, 10);

  return { topUsed };
}

async function getValuationReport(restaurantId: string) {
  const { data } = await supabase
    .from('stock_levels')
    .select(`
      *,
      ingredients:ingredient_id (name, category, unit)
    `)
    .eq('restaurant_id', restaurantId);

  const stockLevels = (data || []) as StockLevelData[];

  const totalValue = stockLevels.reduce((sum, item) => 
    sum + (item.current_quantity * (item.unit_cost || 0)), 0);

  const categoryValue = stockLevels
    .reduce((acc: any[], item) => {
      const category = item.ingredients?.category || 'Other';
      const value = item.current_quantity * (item.unit_cost || 0);
      
      const existing = acc.find(cat => cat.name === category);
      if (existing) {
        existing.value += value;
      } else {
        acc.push({ name: category, value });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => b.value - a.value);

  const highValueItems = stockLevels
    .map(item => ({
      name: item.ingredients?.name,
      quantity: item.current_quantity,
      unit: item.ingredients?.unit,
      unitCost: item.unit_cost || 0,
      totalValue: item.current_quantity * (item.unit_cost || 0),
    }))
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .slice(0, 10);

  return { totalValue, categoryValue, highValueItems };
}

async function getTrendsReport(from: Date, to: Date, restaurantId: string) {
  // 1. Get top 5 ingredients by stock level
  const { data: topStock } = await supabase
    .from('stock_levels')
    .select('ingredient_id, current_quantity, ingredients(name)')
    .eq('restaurant_id', restaurantId)
    .order('current_quantity', { ascending: false })
    .limit(5);

  if (!topStock?.length) return { 
    stockTrends: [], 
    ingredients: [], 
    averageTurnover: 0, 
    turnoverTrend: 0, 
    stockOuts: 0, 
    reorderFrequency: 0 
  };

  const ingredientIds = topStock.map((i: any) => i.ingredient_id);
  const ingredientNames = topStock.reduce((acc: any, curr: any) => {
    acc[curr.ingredient_id] = curr.ingredients?.name;
    return acc;
  }, {});

  // 2. Get transactions for these ingredients since 'from' (fetching up to NOW to calculate backwards)
  const { data: transactions } = await supabase
    .from('stock_transactions')
    .select('ingredient_id, quantity_change, created_at')
    .eq('restaurant_id', restaurantId)
    .in('ingredient_id', ingredientIds)
    .gte('created_at', from.toISOString())
    .order('created_at', { ascending: false }); // Newest first

  const allTransactions = transactions || [];
  
  // Map of ingredient -> current quantity
  const currentStocks: Record<string, number> = {};
  topStock.forEach((item: any) => {
    currentStocks[item.ingredient_id] = item.current_quantity;
  });

  const dataPoints: any[] = [];
  const fmtDate = (d: Date) => d.toISOString().split('T')[0];
  
  let txIndex = 0;
  const loopDate = new Date(); // Start from today
  loopDate.setHours(23, 59, 59, 999);
  
  const fromDate = new Date(from);
  fromDate.setHours(0, 0, 0, 0);
  
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);
  
  // Tracking stock state as we rewind
  const trackingStock = { ...currentStocks };

  while (loopDate >= fromDate) {
    const dateStr = fmtDate(loopDate);
    
    // Capture state if within requested range
    if (loopDate <= toDate) {
        const point: any = { date: dateStr };
        ingredientIds.forEach((id: string) => {
            point[ingredientNames[id]] = Number(trackingStock[id].toFixed(2));
        });
        dataPoints.unshift(point);
    }
    
    // Reverse transactions of this day
    const dayStart = new Date(loopDate);
    dayStart.setHours(0,0,0,0);
    
    while(txIndex < allTransactions.length) {
        const tx = allTransactions[txIndex];
        const txDate = new Date(tx.created_at);
        
        if (txDate > loopDate) {
             txIndex++; // Should have been processed already or is future relative to loop (unlikely if loop starts now)
             continue;
        }
        if (txDate < dayStart) {
            break; // Belongs to previous day
        }
        
        // Reverse the transaction: previous = current - change
        if (trackingStock[tx.ingredient_id] !== undefined) {
            trackingStock[tx.ingredient_id] -= tx.quantity_change;
        }
        
        txIndex++;
    }
    
    // Move to previous day
    loopDate.setDate(loopDate.getDate() - 1);
  }

  return {
    stockTrends: dataPoints,
    ingredients: Object.values(ingredientNames),
    averageTurnover: 0, // Placeholder
    turnoverTrend: 0,
    stockOuts: 0,
    reorderFrequency: 0,
  };
}

function convertToCSV(data: any): string {
  if (!data) return '';
  
  // Convert data to CSV format based on report type
  const headers = Object.keys(data).join(',');
  const rows = Object.values(data).map((row: any) => 
    Array.isArray(row) ? row.map(item => JSON.stringify(item)).join(',') : JSON.stringify(row)
  ).join('\n');
  
  return `${headers}\n${rows}`;
}
