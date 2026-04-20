import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useAnalytics } from '@/hooks/use-analytics';

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const { data: analytics, isLoading: loading } = useAnalytics(dateRange);

  const exportData = () => {
    // Implementation for data export
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-6 w-6" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDateRange('7d')}>
            <Badge variant={dateRange === '7d' ? 'default' : 'secondary'}>7D</Badge>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDateRange('30d')}>
            <Badge variant={dateRange === '30d' ? 'default' : 'secondary'}>30D</Badge>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDateRange('90d')}>
            <Badge variant={dateRange === '90d' ? 'default' : 'secondary'}>90D</Badge>
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.revenue.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{analytics.revenue.growth}%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.customers.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">+{analytics.customers.new}</span> new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Reservations</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.reservations.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.reservations.conversion}% conversion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.satisfaction}/5.0</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.performance.uptime}% uptime
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.revenue.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="target" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={analytics.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Sources and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Direct Bookings</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Partner Platforms</span>
                    <span className="font-medium">22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Walk-ins</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Distribution by customer type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics.customers.segments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.customers.segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Retention Rate</span>
                    <Badge>{analytics.customers.retention}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>New Customers</span>
                    <Badge variant="secondary">{analytics.customers.new}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg. Lifetime Value</span>
                    <Badge variant="outline">$2,450</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">Average API response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.uptime}%</div>
                <p className="text-xs text-muted-foreground">System availability</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.errorRate}%</div>
                <p className="text-xs text-muted-foreground">System errors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.satisfaction}/5.0</div>
                <p className="text-xs text-muted-foreground">User rating</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>Booking patterns throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.reservations.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
