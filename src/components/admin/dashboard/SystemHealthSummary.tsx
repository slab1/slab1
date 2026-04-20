
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Database, Server, Zap } from 'lucide-react';
import { dbOptimizer } from '@/utils/database-optimizer';
import { errorMonitor } from '@/utils/error-monitoring';
import { restaurantCache } from '@/utils/advanced-cache-manager';
import { performanceTracker } from '@/utils/performance-tracker';

interface SystemHealthSummaryProps {
  onViewFullReport: () => void;
}

export function SystemHealthSummary({ onViewFullReport }: SystemHealthSummaryProps) {
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setDbHealth(await dbOptimizer.testDatabaseHealth());
        setErrorStats(errorMonitor.getErrorStats());
        setCacheStats(restaurantCache.getStats());
        setPerformanceStats(performanceTracker.getPerformanceStats());
      } catch (error) {
        console.error('Failed to fetch system stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5 text-indigo-500" />
              System Infrastructure
            </CardTitle>
            <CardDescription>Real-time status of platform core services</CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Database className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Database</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${dbHealth?.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {dbHealth?.isHealthy ? 'Healthy' : 'Degraded'}
              </span>
              <div className={`h-2 w-2 rounded-full ${dbHealth?.isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>

          <div className="flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Server className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Latency</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-indigo-600">
                {performanceStats?.averageDuration ? `${performanceStats.averageDuration}ms` : '---'}
              </span>
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
            </div>
          </div>

          <div className="flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Cache</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-600">
                {cacheStats?.hitRate ? `${cacheStats.hitRate.toFixed(1)}%` : '---'}
              </span>
              <div className="h-2 w-2 rounded-full bg-purple-500" />
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          className="w-full mt-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors" 
          size="sm"
          onClick={onViewFullReport}
        >
          View detailed health metrics
        </Button>
      </CardContent>
    </Card>
  );
}
