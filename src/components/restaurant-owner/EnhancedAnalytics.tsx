
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BarChart3, TrendingUp, Calendar, DollarSign, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemoryOptimizer } from "@/utils/memory-optimizer";

interface EnhancedAnalyticsProps {
  restaurantId?: string;
}

// Sample data - in a real app this would come from API
const revenueData = [
  { name: 'Jan', revenue: 4000, reservations: 50 },
  { name: 'Feb', revenue: 3000, reservations: 40 },
  { name: 'Mar', revenue: 5000, reservations: 65 },
  { name: 'Apr', revenue: 7000, reservations: 85 },
  { name: 'May', revenue: 6000, reservations: 75 },
  { name: 'Jun', revenue: 8000, reservations: 90 },
  { name: 'Jul', revenue: 9500, reservations: 120 },
];

const weekdayData = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 63 },
  { name: 'Thu', value: 78 },
  { name: 'Fri', value: 115 },
  { name: 'Sat', value: 130 },
  { name: 'Sun', value: 92 },
];

const timeSlotData = [
  { name: '17:00', value: 15 },
  { name: '18:00', value: 35 },
  { name: '19:00', value: 52 },
  { name: '20:00', value: 48 },
  { name: '21:00', value: 30 },
  { name: '22:00', value: 20 },
];

const reservationSourceData = [
  { name: 'Website', value: 55 },
  { name: 'Mobile App', value: 30 },
  { name: 'Phone', value: 10 },
  { name: 'Walk-in', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function EnhancedAnalytics({ restaurantId }: EnhancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartView, setChartView] = useState<'revenue' | 'reservations' | 'combined'>('combined');
  const { scheduleCleanup } = useMemoryOptimizer();

  useEffect(() => {
    // Schedule cleanup when component mounts to ensure a clean state
    scheduleCleanup();

    // Schedule cleanup on unmount
    return () => {
      scheduleCleanup();
    };
  }, [scheduleCleanup]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Enhanced Analytics Dashboard</CardTitle>
            <CardDescription>
              Visualize your restaurant's performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              defaultValue={timeRange} 
              onValueChange={(value: 'week' | 'month' | 'quarter' | 'year') => setTimeRange(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="h-4 w-4 mr-2" /> Trends
            </TabsTrigger>
            <TabsTrigger value="reservations">
              <Calendar className="h-4 w-4 mr-2" /> Reservations
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="h-4 w-4 mr-2" /> Customers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" /> 
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4">
                  <div className="text-2xl font-bold">$42,500</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-green-500 font-medium">↑ 12%</span> 
                    <span className="ml-1">vs last {timeRange}</span>
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" /> 
                    Total Reservations
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4">
                  <div className="text-2xl font-bold">527</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-green-500 font-medium">↑ 8%</span> 
                    <span className="ml-1">vs last {timeRange}</span>
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" /> 
                    Avg. Party Size
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4">
                  <div className="text-2xl font-bold">3.8</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-green-500 font-medium">↑ 4%</span> 
                    <span className="ml-1">vs last {timeRange}</span>
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4 px-6">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" /> 
                    Avg. Revenue/Reservation
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4">
                  <div className="text-2xl font-bold">$80.64</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className="text-green-500 font-medium">↑ 3.5%</span> 
                    <span className="ml-1">vs last {timeRange}</span>
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Revenue and reservations chart */}
            <Card>
              <CardHeader className="py-4 px-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">
                    Revenue & Reservations
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant={chartView === 'revenue' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartView('revenue')}
                    >
                      Revenue
                    </Button>
                    <Button 
                      variant={chartView === 'reservations' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartView('reservations')}
                    >
                      Reservations
                    </Button>
                    <Button 
                      variant={chartView === 'combined' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartView('combined')}
                    >
                      Combined
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-0 px-6 pb-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartView === 'combined' ? (
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                        <YAxis yAxisId="right" orientation="right" stroke="#00C49F" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#0088FE" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="reservations" 
                          stroke="#00C49F" 
                        />
                      </LineChart>
                    ) : chartView === 'revenue' ? (
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#0088FE" />
                      </BarChart>
                    ) : (
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="reservations" fill="#00C49F" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Analytical insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Busiest Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekdayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Popular Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSlotData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reservation Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reservationSourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {reservationSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="h-[500px] flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">Trends analysis coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="reservations">
            <div className="h-[500px] flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">Detailed reservation analytics coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="customers">
            <div className="h-[500px] flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">Customer analytics coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
