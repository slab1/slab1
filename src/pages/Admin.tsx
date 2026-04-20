import { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RestaurantsTable } from "@/components/admin/RestaurantsTable";
import { LocationsTable } from "@/components/admin/LocationsTable";
import { UsersTable } from "@/components/admin/UsersTable";
import { ReservationsTable } from "@/components/admin/ReservationsTable";
import { AuditLogsTable } from "@/components/admin/AuditLogsTable";
import { SystemHealthDashboard } from "@/components/admin/SystemHealthDashboard";
import { DemoPaymentForm } from '@/components/admin/DemoPaymentForm';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SystemStatusIndicator } from '@/components/common/SystemStatusIndicator';
import { useAuth } from '@/hooks/use-auth';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';
import { BusinessAnalyticsDashboard } from '@/components/analytics/BusinessAnalyticsDashboard';
import { StatsCards } from '@/components/admin/dashboard/StatsCards';
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';
import { ReservationsTab } from '@/components/restaurant-owner/ReservationsTab';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { SystemHealthSummary } from '@/components/admin/dashboard/SystemHealthSummary';
import { ErrorHandler } from '@/utils/error-handling';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { SystemConfig } from '@/components/admin/SystemConfig';
import { TestingPanel } from '@/components/admin/TestingPanel';
import { SubscriptionPlansTable } from '@/components/admin/SubscriptionPlansTable';
import { DatabaseManager } from '@/components/admin/database/DatabaseManager';
import { DeveloperSettings } from '@/components/admin/DeveloperSettings';
import { LoyaltyManagement } from '@/components/admin/LoyaltyManagement';

// Lazy load components to prevent circular dependencies and module fetch issues
const StaffDashboard = lazy(() => import('@/pages/StaffDashboard'));
const RestaurantOwner = lazy(() => import('@/pages/RestaurantOwner'));
const MarketingHub = lazy(() => import('@/pages/MarketingHub'));

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Permission checks
  const canManageUsers = user?.role === 'system_admin' || user?.role === 'superadmin';
  const canCreateDemoPayments = user?.role === 'system_admin' || user?.role === 'superadmin';
  const canManageDatabase = user?.role === 'system_admin' || user?.role === 'superadmin';
  const canManageStaff = user?.role === 'restaurant_manager' || user?.role === 'system_admin' || user?.role === 'superadmin';
  const isRestaurantOwner = user?.role === 'restaurant_owner' || user?.role === 'restaurant_manager' || user?.role === 'system_admin' || user?.role === 'superadmin';


  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Platform Intelligence</h2>
                <p className="text-slate-500 max-w-2xl">
                  Analyze performance, monitor system health, and manage your global restaurant network from a centralized command center.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                Live Data Feed
              </div>
            </div>
            
            <StatsCards />
            
            <div className="grid gap-8 grid-cols-1 xl:grid-cols-2">
              <SystemHealthSummary onViewFullReport={() => setActiveTab('health')} />

              <div className="space-y-8">
                <RealTimeMetrics />
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return <AdvancedAnalyticsDashboard />;

      case 'business-intelligence':
        return <BusinessAnalyticsDashboard />;

      case 'restaurants':
        return <RestaurantsTable />;

      case 'reservations':
        return <ReservationsTab />;

      case 'users':
        return canManageUsers ? (
          <UsersTable />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to manage users</CardDescription>
            </CardHeader>
          </Card>
        );

      case 'staff':
        return canManageStaff ? (
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }>
            <StaffDashboard />
          </Suspense>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to manage staff</CardDescription>
            </CardHeader>
          </Card>
        );

        case 'restaurant-owner':
          return isRestaurantOwner ? (
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            }>
              <RestaurantOwner />
            </Suspense>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You don't have permission to manage restaurant owners</CardDescription>
              </CardHeader>
            </Card>
          );
      case 'reviews':
        return <ReviewsList restaurantId={''} />;

      case 'marketing':
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }>
            <MarketingHub />
          </Suspense>
        );

      case 'loyalty':
        return <LoyaltyManagement />;

      case 'locations':
        return <LocationsTable />;

      case 'demo-payments':
        return canCreateDemoPayments ? (
          <DemoPaymentForm />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to create demo payments</CardDescription>
            </CardHeader>
          </Card>
        );

      case 'database':
        return canManageDatabase ? (
          <DatabaseManager />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to manage the database</CardDescription>
            </CardHeader>
          </Card>
        );

      case 'health':
        return <SystemHealthDashboard />;

      case 'audit-logs':
        return canManageDatabase ? <AuditLogsTable /> : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to view audit logs</CardDescription>
            </CardHeader>
          </Card>
        );

      case 'system-config':
        return (user?.role === 'superadmin' || user?.role === 'system_admin') ? (
          <SystemConfig />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to manage system configuration</CardDescription>
            </CardHeader>
          </Card>
        );

      case 'developer':
        return (user?.role === 'superadmin' || user?.role === 'system_admin') ? (
          <DeveloperSettings />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to access developer settings</CardDescription>
            </CardHeader>
          </Card>
        );

      case 'subscriptions':
        return (user?.role === 'superadmin' || user?.role === 'system_admin') ? (
          <SubscriptionPlansTable />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to manage subscriptions</CardDescription>
            </CardHeader>
          </Card>
        );

      case 'testing-panel':
        return (user?.role === 'superadmin' || user?.role === 'system_admin') ? (
          <TestingPanel />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to access the testing panel</CardDescription>
            </CardHeader>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Admin Dashboard</CardTitle>
              <CardDescription>Select a section from the sidebar to get started</CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the admin dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider key={user.id}>
      <div className="min-h-screen flex w-full">
        <AdminSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          canManageUsers={canManageUsers}
          canCreateDemoPayments={canCreateDemoPayments}
          canManageDatabase={canManageDatabase}
          canManageStaff={canManageStaff}
          isRestaurantOwner={isRestaurantOwner}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between overflow-hidden">
              <h1 className="text-lg md:text-xl font-bold truncate">Admin Dashboard</h1>
              <SystemStatusIndicator />
            </div>
          </header>
          <div className="flex-1 overflow-x-hidden">
            <div className="container mx-auto py-6 md:py-10 px-4 max-w-7xl">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                renderTabContent()
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
