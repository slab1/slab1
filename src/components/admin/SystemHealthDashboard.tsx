
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Server,
  Zap
} from 'lucide-react';
import { errorMonitor } from '@/utils/error-monitoring';
import { dbOptimizer } from '@/utils/database-optimizer';
import { restaurantCache } from '@/utils/advanced-cache-manager';
import { performanceTracker } from '@/utils/performance-tracker';

export function SystemHealthDashboard() {
  const [errorStats, setErrorStats] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [dbHealth, setDbHealth] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setErrorStats(errorMonitor.getErrorStats());
        setDbStats(dbOptimizer.getPerformanceStats());
        setCacheStats(restaurantCache.getStats());
        setPerformanceStats(performanceTracker.getPerformanceStats());
        setDbHealth(await dbOptimizer.testDatabaseHealth());
      } catch (error) {
        console.error('Failed to fetch system stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    if (!dbHealth || !errorStats) return 'loading';
    
    const criticalErrors = errorStats.criticalCount > 0;
    const highErrorRate = errorStats.last24Hours > 100;
    const dbDown = !dbHealth.isHealthy;
    const slowDb = dbHealth.responseTime > 1000;

    if (criticalErrors || dbDown) return 'critical';
    if (highErrorRate || slowDb) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'healthy': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Loading</Badge>;
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring of system performance and health</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${getStatusColor(healthStatus)}`} />
          {getStatusBadge(healthStatus)}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dbHealth?.isHealthy ? (
                <span className="text-green-600">Online</span>
              ) : (
                <span className="text-red-600">Offline</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Response: {dbHealth?.responseTime || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorStats?.unresolvedCount || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              {errorStats?.last24Hours || 0} in 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.hitRate?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-muted-foreground">
              {cacheStats?.hits || 0} hits, {cacheStats?.misses || 0} misses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceStats?.averageDuration || 0}ms
            </div>
            <div className="text-sm text-muted-foreground">
              {performanceStats?.totalOperations || 0} operations
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error Monitoring</TabsTrigger>
          <TabsTrigger value="database">Database Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache Statistics</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Monitoring</CardTitle>
              <CardDescription>System errors and their severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              {errorStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {errorStats.bySeverity.critical}
                      </div>
                      <div className="text-sm text-muted-foreground">Critical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {errorStats.bySeverity.high}
                      </div>
                      <div className="text-sm text-muted-foreground">High</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {errorStats.bySeverity.medium}
                      </div>
                      <div className="text-sm text-muted-foreground">Medium</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {errorStats.bySeverity.low}
                      </div>
                      <div className="text-sm text-muted-foreground">Low</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Error Resolution Rate</span>
                      <span>
                        {errorStats.total > 0 
                          ? (((errorStats.total - errorStats.unresolvedCount) / errorStats.total) * 100).toFixed(1)
                          : 100}%
                      </span>
                    </div>
                    <Progress 
                      value={errorStats.total > 0 
                        ? ((errorStats.total - errorStats.unresolvedCount) / errorStats.total) * 100
                        : 100} 
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>Query performance and database health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {dbStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold">Query Success Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        {(100 - dbStats.errorRate).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold">Slow Query Rate</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {dbStats.slowQueryRate?.toFixed(1) || 0}%
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold">Total Queries</div>
                      <div className="text-2xl font-bold">
                        {dbStats.totalQueries}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Caching efficiency and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {cacheStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold">Hit Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        {cacheStats.hitRate?.toFixed(1) ?? '0.0'}%
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold">Cache Size</div>
                      <div className="text-2xl font-bold">
                        {cacheStats.size}
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold">Evictions</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {cacheStats.evictions}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Application performance and response times</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold">Avg Response Time</div>
                      <div className="text-2xl font-bold">
                        {performanceStats.averageDuration}ms
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold">Slow Operations</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {performanceStats.slowOperationRate?.toFixed(1) || 0}%
                      </div>
                    </div>
                  </div>

                  {performanceStats.slowestOperations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Slowest Operations</h4>
                      <div className="space-y-2">
                        {performanceStats.slowestOperations.slice(0, 5).map((op: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{op.name}</span>
                            <span className="text-sm text-muted-foreground">{op.duration}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
