
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartRecommendations } from '@/components/recommendations/SmartRecommendations';
import { useAuth } from '@/hooks/use-auth';
import { CalendarDays, TrendingUp, Users, Star } from 'lucide-react';

export default function EnhancedDashboard() {
  const { user } = useAuth();

  const quickStats = [
    {
      title: 'Upcoming Reservations',
      value: '3',
      icon: CalendarDays,
      description: 'Next 7 days'
    },
    {
      title: 'Favorite Restaurants',
      value: '12',
      icon: Star,
      description: 'Your saved places'
    },
    {
      title: 'Total Visits',
      value: '47',
      icon: Users,
      description: 'This year'
    },
    {
      title: 'Loyalty Points',
      value: '2,450',
      icon: TrendingUp,
      description: 'Available to redeem'
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'Guest'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your dining experience today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Smart Recommendations */}
        <SmartRecommendations userId={user?.id} />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">The Garden Bistro</h4>
                    <p className="text-sm text-muted-foreground">Tomorrow, 7:00 PM</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Confirmed</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sakura Sushi</h4>
                    <p className="text-sm text-muted-foreground">Friday, 6:30 PM</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 border rounded-lg hover:bg-muted transition-colors text-left">
                  <h4 className="font-medium text-sm">Find Restaurants</h4>
                  <p className="text-xs text-muted-foreground">Discover new places</p>
                </button>
                <button className="p-3 border rounded-lg hover:bg-muted transition-colors text-left">
                  <h4 className="font-medium text-sm">Book a Chef</h4>
                  <p className="text-xs text-muted-foreground">Private dining</p>
                </button>
                <button className="p-3 border rounded-lg hover:bg-muted transition-colors text-left">
                  <h4 className="font-medium text-sm">View Favorites</h4>
                  <p className="text-xs text-muted-foreground">Your saved places</p>
                </button>
                <button className="p-3 border rounded-lg hover:bg-muted transition-colors text-left">
                  <h4 className="font-medium text-sm">Loyalty Rewards</h4>
                  <p className="text-xs text-muted-foreground">Redeem points</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
