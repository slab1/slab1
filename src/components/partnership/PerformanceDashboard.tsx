
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  Zap
} from "lucide-react";

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    responseTime: 95,
    uptime: 99.9,
    throughput: 1247,
    errorRate: 0.02
  });

  const responseTimeData = [
    { time: '00:00', response: 85 },
    { time: '04:00', response: 78 },
    { time: '08:00', response: 92 },
    { time: '12:00', response: 110 },
    { time: '16:00', response: 125 },
    { time: '20:00', response: 95 },
  ];

  const throughputData = [
    { time: '00:00', requests: 850 },
    { time: '04:00', requests: 620 },
    { time: '08:00', requests: 1200 },
    { time: '12:00', requests: 1850 },
    { time: '16:00', requests: 2100 },
    { time: '20:00', requests: 1450 },
  ];

  const errorData = [
    { time: '00:00', errors: 2 },
    { time: '04:00', errors: 1 },
    { time: '08:00', errors: 3 },
    { time: '12:00', errors: 5 },
    { time: '16:00', errors: 4 },
    { time: '20:00', errors: 2 },
  ];

  const statusItems = [
    {
      service: 'API Gateway',
      status: 'operational',
      uptime: 99.95,
      responseTime: 45
    },
    {
      service: 'Database',
      status: 'operational',
      uptime: 99.98,
      responseTime: 12
    },
    {
      service: 'Payment Processing',
      status: 'operational',
      uptime: 99.99,
      responseTime: 156
    },
    {
      service: 'File Storage',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 340
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'outage': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertCircle className="h-4 w-4" />;
      case 'outage': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-5ms</span> from last hour
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.02%</span> from last month
            </p>
            <Progress value={metrics.uptime} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.throughput}</div>
            <p className="text-xs text-muted-foreground">requests/minute</p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.01%</span> from yesterday
            </p>
            <Progress value={metrics.errorRate * 50} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Charts */}
      <Tabs defaultValue="response-time" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="throughput">Throughput</TabsTrigger>
          <TabsTrigger value="errors">Error Rate</TabsTrigger>
        </TabsList>

        <TabsContent value="response-time">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>
                Average API response times over the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}ms`, 'Response Time']} />
                  <Line 
                    type="monotone" 
                    dataKey="response" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="throughput">
          <Card>
            <CardHeader>
              <CardTitle>Request Throughput</CardTitle>
              <CardDescription>
                Number of requests processed per minute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Requests/min']} />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Monitoring</CardTitle>
              <CardDescription>
                System errors and failed requests tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Errors']} />
                  <Bar dataKey="errors" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>
            Real-time status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <h4 className="font-medium">{item.service}</h4>
                    <p className="text-sm text-gray-500">
                      {item.uptime}% uptime • {item.responseTime}ms avg response
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={item.status === 'operational' ? 'default' : 'secondary'}
                  className={getStatusColor(item.status)}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
