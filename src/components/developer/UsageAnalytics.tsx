import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface UsageLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  created_at: string;
}

interface ApiKey {
  id: string;
  name: string;
  request_count: number;
  monthly_quota: number;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent-foreground))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--destructive))',
];

export const UsageAnalytics: React.FC = () => {
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['api_usage_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as UsageLog[];
    },
  });

  const { data: keys, isLoading: keysLoading } = useQuery({
    queryKey: ['api_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, request_count, monthly_quota')
        .order('request_count', { ascending: false });
      if (error) throw error;
      return data as ApiKey[];
    },
  });

  const isLoading = logsLoading || keysLoading;

  // Compute analytics
  const analytics = useMemo(() => {
    if (!logs || !keys) return null;

    const totalRequests = keys.reduce((s, k) => s + (k.request_count || 0), 0);
    const errorCount = logs.filter((l) => l.status_code >= 400).length;
    const errorRate = logs.length > 0 ? ((errorCount / logs.length) * 100).toFixed(1) : '0';

    // Daily usage (last 7 days)
    const dailyMap = new Map<string, number>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyMap.set(d.toISOString().split('T')[0], 0);
    }
    logs.forEach((l) => {
      const day = l.created_at?.split('T')[0];
      if (day && dailyMap.has(day)) {
        dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
      }
    });
    const dailyData = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      requests: count,
    }));

    // Top endpoints
    const endpointMap = new Map<string, number>();
    logs.forEach((l) => {
      const key = `${l.method} ${l.endpoint}`;
      endpointMap.set(key, (endpointMap.get(key) || 0) + 1);
    });
    const topEndpoints = Array.from(endpointMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Status breakdown
    const statusMap = new Map<string, number>();
    logs.forEach((l) => {
      const bucket = l.status_code < 300 ? '2xx Success' : l.status_code < 400 ? '3xx Redirect' : l.status_code < 500 ? '4xx Client Error' : '5xx Server Error';
      statusMap.set(bucket, (statusMap.get(bucket) || 0) + 1);
    });
    const statusData = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

    return { totalRequests, errorRate, errorCount, dailyData, topEndpoints, statusData };
  }, [logs, keys]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No usage data yet. Make some API requests to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: analytics.totalRequests.toLocaleString(), icon: BarChart3, badge: null },
          { label: 'Error Rate', value: `${analytics.errorRate}%`, icon: AlertTriangle, badge: Number(analytics.errorRate) > 5 ? 'destructive' as const : 'secondary' as const },
          { label: 'Errors (7d)', value: analytics.errorCount.toString(), icon: AlertTriangle, badge: null },
          { label: 'Active Keys', value: (keys?.length || 0).toString(), icon: TrendingUp, badge: null },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  {stat.badge && <Badge variant={stat.badge} className="text-[9px]">High</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Requests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Requests (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyData}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Code Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Response Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {analytics.statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      fontSize={11}
                    >
                      {analytics.statusData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Endpoints</CardTitle>
          <CardDescription>Most frequently accessed endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topEndpoints.length > 0 ? (
            <div className="space-y-3">
              {analytics.topEndpoints.map((ep, i) => {
                const maxVal = analytics.topEndpoints[0]?.value || 1;
                return (
                  <div key={ep.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-shrink-0">{ep.name}</code>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(ep.value / maxVal) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">{ep.value}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No endpoint data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Per-Key Usage */}
      {keys && keys.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Usage by API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keys.map((key) => {
                const pct = key.monthly_quota > 0 ? (key.request_count / key.monthly_quota) * 100 : 0;
                return (
                  <div key={key.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-32 truncate">{key.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-24 text-right">
                      {key.request_count.toLocaleString()} / {key.monthly_quota.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
