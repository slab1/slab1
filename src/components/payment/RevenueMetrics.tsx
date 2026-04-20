
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { restaurantPaymentApi } from "@/api/restaurant/payment";
import { toast } from "sonner";

interface RevenueMetricsProps {
  restaurantId: string;
}

interface RevenueData {
  totalRevenue: number;
  reservationRevenue: number;
  averageTransaction: number;
  transactionCount: number;
  refunds: number;
  dailyRevenue: Array<{ name: string; value: number }>;
  monthlyRevenue: Array<{ name: string; value: number }>;
  transactionsByType: Array<{ name: string; value: number }>;
}

export function RevenueMetrics({ restaurantId }: RevenueMetricsProps) {
  const [period, setPeriod] = useState('7d');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await restaurantPaymentApi.getRevenueAnalytics(restaurantId, period);
      
      if (data && typeof data === 'object' && 'totalRevenue' in data) {
        setRevenueData(data as RevenueData);
      } else {
        console.error('Invalid revenue data:', data);
        setRevenueData(null);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
      toast.error('Failed to load revenue metrics');
      setRevenueData(null);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, period]);

  useEffect(() => {
    loadRevenueData();
  }, [loadRevenueData]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!revenueData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Failed to load revenue data. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Revenue Analytics</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.averageTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.transactionCount}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.refunds.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Revenue trends over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
            <CardDescription>Breakdown by transaction type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData.transactionsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.transactionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Revenue performance over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
