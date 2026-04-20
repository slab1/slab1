import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Utensils, MapPin, CalendarDays } from 'lucide-react';
import { StatsCards } from './dashboard/StatsCards';
import { QuickActions } from './dashboard/QuickActions';

interface AdminOverviewProps {
  onTabChange: (tab: string) => void;
  canManageUsers: boolean;
  canCreateDemoPayments: boolean;
  canManageStaff: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ 
  onTabChange, 
  canManageUsers, 
  canCreateDemoPayments, 
  canManageStaff 
}) => {
  return (
    <div className="space-y-4">
      <StatsCards />
      <QuickActions 
        onTabChange={onTabChange}
        canManageUsers={canManageUsers}
        canCreateDemoPayments={canCreateDemoPayments}
        canManageStaff={canManageStaff}
      />
    </div>
  );
};
