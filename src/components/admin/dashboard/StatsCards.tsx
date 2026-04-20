import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Utensils, MapPin, CalendarDays } from 'lucide-react';
import { useAdminStats } from '@/hooks/use-admin-stats';
import { Skeleton } from '@/components/ui/skeleton';

export const StatsCards: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
        <div className="h-1 bg-blue-500 w-full" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Restaurants</CardTitle>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Utensils className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats?.restaurants ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all categories
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
        <div className="h-1 bg-emerald-500 w-full" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Locations</CardTitle>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <MapPin className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats?.locations ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Global network
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
        <div className="h-1 bg-amber-500 w-full" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Reservations</CardTitle>
          <div className="p-2 bg-amber-50 rounded-lg">
            <CalendarDays className="h-5 w-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats?.reservations ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting confirmation
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
        <div className="h-1 bg-purple-500 w-full" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Users</CardTitle>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats?.users ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered profiles
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
