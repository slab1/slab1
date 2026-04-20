
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Users, 
  Clock, 
  TrendingUp,
  Zap,
  Signal
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface RealTimeData {
  activeUsers: number;
  currentReservations: number;
  systemLoad: number;
  responseTime: number;
  errorRate: number;
  lastUpdated: Date;
}

export const RealTimeMetrics: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    activeUsers: 0,
    currentReservations: 0,
    systemLoad: 0,
    responseTime: 0,
    errorRate: 0,
    lastUpdated: new Date()
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize real-time data
    fetchRealTimeData();

    // Set up real-time subscription
    const channel = supabase.channel('realtime-metrics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservations'
      }, () => {
        fetchRealTimeData();
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Update metrics every 5 seconds
    const interval = setInterval(fetchRealTimeData, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchRealTimeData = async () => {
    try {
      // Fetch current reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('reservation_date', new Date().toISOString().split('T')[0])
        .in('status', ['confirmed', 'pending']);

      // Mock real-time metrics (in production, these would come from monitoring systems)
      const mockData: RealTimeData = {
        activeUsers: Math.floor(Math.random() * 150) + 50,
        currentReservations: reservations?.length || 0,
        systemLoad: Math.random() * 100,
        responseTime: Math.random() * 200 + 50,
        errorRate: Math.random() * 2,
        lastUpdated: new Date()
      };

      setRealTimeData(mockData);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5 text-rose-500" />
              Live Performance
            </CardTitle>
            <CardDescription>Real-time system monitoring</CardDescription>
          </div>
          <Badge 
            variant={isConnected ? "outline" : "destructive"}
            className={isConnected ? "bg-emerald-50 text-emerald-700 border-emerald-100" : ""}
          >
            <Signal className={`h-3 w-3 mr-1 ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Active Users</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {realTimeData.activeUsers}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last hour</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Response Time</span>
            </div>
            <div className={`text-2xl font-bold tracking-tight ${getStatusColor(realTimeData.responseTime, { good: 150, warning: 300 })}`}>
              {Math.round(realTimeData.responseTime)}ms
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <Zap className="h-3 w-3" />
              <span>Optimized</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-tight">System Load</span>
            </div>
            <div className={`text-2xl font-bold tracking-tight ${getStatusColor(realTimeData.systemLoad, { good: 40, warning: 75 })}`}>
              {Math.round(realTimeData.systemLoad)}%
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full transition-all duration-500 ${realTimeData.systemLoad > 75 ? 'bg-rose-500' : realTimeData.systemLoad > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${realTimeData.systemLoad}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Error Rate</span>
            </div>
            <div className={`text-2xl font-bold tracking-tight ${getStatusColor(realTimeData.errorRate, { good: 0.5, warning: 1.5 })}`}>
              {realTimeData.errorRate.toFixed(2)}%
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <span>Within normal range</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          <span>Last synchronized</span>
          <span>{formatTime(realTimeData.lastUpdated)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
