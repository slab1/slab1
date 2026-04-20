import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onTabChange: (tab: string) => void;
  canManageUsers: boolean;
  canCreateDemoPayments: boolean;
  canManageStaff: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onTabChange,
  canManageUsers,
  canCreateDemoPayments,
  canManageStaff
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Commonly used management tasks</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button onClick={() => onTabChange("restaurants")}>Manage Restaurants</Button>
        <Button onClick={() => onTabChange("reservations")}>View Reservations</Button>
        <Button onClick={() => onTabChange("locations")}>Manage Locations</Button>
        {canManageUsers && (
          <Button onClick={() => onTabChange("users")}>Manage Users</Button>
        )}
        {canManageStaff && (
          <Button onClick={() => onTabChange("staff-dashboard")}>Staff Dashboard</Button>
        )}
        {canManageStaff && (
          <Button onClick={() => onTabChange("staff")}>Manage Staff</Button>
        )}
        {canCreateDemoPayments && (
          <Button onClick={() => onTabChange("payments")}>Create Demo Payment</Button>
        )}
      </CardContent>
    </Card>
  );
};
