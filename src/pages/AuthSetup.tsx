
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Users, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ProfileSetup } from '@/components/auth/ProfileSetup';
import { Container } from '@/components/ui/container';

export default function AuthSetup() {
  const { user } = useAuth();
  const [setupComplete, setSetupComplete] = useState(false);

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Authentication & Setup</h1>
          <p className="text-muted-foreground">
            Complete your restaurant booking system setup
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <ProfileSetup onComplete={() => setSetupComplete(true)} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  System Features
                </CardTitle>
                <CardDescription>
                  Available features in your restaurant system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Restaurant Browsing</span>
                    <span className="text-green-600 text-sm">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Table Reservations</span>
                    <span className="text-green-600 text-sm">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chef Bookings</span>
                    <span className="text-green-600 text-sm">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Real-time Updates</span>
                    <span className="text-green-600 text-sm">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin Dashboard</span>
                    {user?.role === 'system_admin' || user?.role === 'restaurant_manager' ? (
                      <span className="text-green-600 text-sm">✓ Available</span>
                    ) : (
                      <span className="text-orange-600 text-sm">Requires upgrade</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Button asChild variant="outline" className="h-auto p-4">
                  <a href="/restaurants" className="flex flex-col items-center gap-2">
                    <span className="font-medium">Browse Restaurants</span>
                    <span className="text-xs text-muted-foreground">View available restaurants</span>
                  </a>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4">
                  <a href="/chefs-warehouse" className="flex flex-col items-center gap-2">
                    <span className="font-medium">Chef Bookings</span>
                    <span className="text-xs text-muted-foreground">Book a private chef</span>
                  </a>
                </Button>
                
                {(user?.role === 'system_admin' || user?.role === 'restaurant_manager') && (
                  <Button asChild className="h-auto p-4">
                    <a href="/admin" className="flex flex-col items-center gap-2">
                      <span className="font-medium">Admin Dashboard</span>
                      <span className="text-xs text-muted-foreground">Manage the system</span>
                    </a>
                  </Button>
                )}
                
                <Button asChild variant="outline" className="h-auto p-4">
                  <a href="/profile" className="flex flex-col items-center gap-2">
                    <span className="font-medium">My Profile</span>
                    <span className="text-xs text-muted-foreground">Update your information</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
