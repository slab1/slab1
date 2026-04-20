import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    monthly: Array<{ month: string; revenue: number; target: number }>;
  };
  customers: {
    total: number;
    new: number;
    retention: number;
    segments: Array<{ name: string; value: number; color: string }>;
    avgReservationsPerCustomer: number;
    topCustomers: Array<{ id: string; name: string; reservations: number; totalSpent: number }>;
  };
  reservations: {
    total: number;
    conversion: number;
    peakHours: Array<{ hour: string; bookings: number }>;
    cancellationRate: number;
    avgPartySize: number;
  };
  performance: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
    satisfaction: number;
    totalRestaurants: number;
    activeReservations: number;
  };
  metrics: Array<{
    id: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    status: 'good' | 'warning' | 'critical';
  }>;
  goals: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    deadline: string;
    status: 'on-track' | 'at-risk' | 'behind';
  }>;
}

export function useAnalytics(dateRange: string = '30d') {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const [reservationsResult, profilesResult, restaurantsResult] = await Promise.all([
        supabase.from('reservations').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('restaurants').select('*')
      ]);

      if (reservationsResult.error) throw reservationsResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (restaurantsResult.error) throw restaurantsResult.error;

      const reservations = reservationsResult.data || [];
      const profiles = profilesResult.data || [];
      const restaurants = restaurantsResult.data || [];

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const totalRevenue = 125000;
      const revenueGrowth = 12.5;

      const totalCustomers = profiles.length;
      const newCustomers = profiles.filter(p => new Date(p.created_at) > thirtyDaysAgo).length;
      const totalReservations = reservations.length;

      const peakHours = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0') + ':00';
        const bookings = reservations.filter(r => {
          const reservationHour = new Date(r.reservation_time).getHours();
          return reservationHour === i;
        }).length;
        return { hour, bookings };
      }).filter(h => h.bookings > 0);

      const customerSegments = [
        { name: 'Premium', value: profiles.filter(p => reservations.filter(r => r.user_id === p.id).length >= 10).length, color: '#8884d8' },
        { name: 'Regular', value: profiles.filter(p => {
            const count = reservations.filter(r => r.user_id === p.id).length;
            return count >= 3 && count < 10;
          }).length, color: '#82ca9d' },
        { name: 'New', value: profiles.filter(p => reservations.filter(r => r.user_id === p.id).length < 3).length, color: '#ffc658' }
      ];

      const monthlyRevenue = [
        { month: 'Jan', revenue: 85000, target: 80000 },
        { month: 'Feb', revenue: 92000, target: 85000 },
        { month: 'Mar', revenue: 108000, target: 90000 },
        { month: 'Apr', revenue: 115000, target: 95000 },
        { month: 'May', revenue: 125000, target: 100000 },
        { month: 'Jun', revenue: 135000, target: 110000 }
      ];

      const avgReservationsPerCustomer = totalReservations / Math.max(totalCustomers, 1);
      const repeatCustomerRate = (profiles.filter(p => reservations.filter(r => r.user_id === p.id).length > 1).length / Math.max(totalCustomers, 1)) * 100;
      const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
      const cancellationRate = (cancelledReservations / Math.max(totalReservations, 1)) * 100;

      const metrics: AnalyticsData['metrics'] = [
        { id: '1', name: 'Monthly Revenue', value: totalRevenue, target: 150000, unit: '$', trend: 'up', change: 12.5, status: 'good' },
        { id: '2', name: 'Customer Acquisition', value: totalCustomers, target: 500, unit: 'customers', trend: 'up', change: 8.3, status: 'warning' },
        { id: '3', name: 'Reservation Rate', value: parseFloat(((totalReservations / 1000) * 100).toFixed(1)), target: 85, unit: '%', trend: 'stable', change: 0.2, status: 'warning' },
        { id: '4', name: 'Customer Satisfaction', value: 4.7, target: 4.5, unit: '/5', trend: 'up', change: 0.3, status: 'good' }
      ];

      const goals: AnalyticsData['goals'] = [
        { id: '1', title: 'Increase Monthly Revenue to $200K', description: 'Target monthly recurring revenue', progress: 125000, target: 200000, deadline: '2024-12-31', status: 'on-track' },
        { id: '2', title: 'Expand to 5 New Locations', description: 'Open new restaurant locations', progress: 2, target: 5, deadline: '2024-10-31', status: 'at-risk' }
      ];

      return {
        revenue: { total: totalRevenue, growth: revenueGrowth, monthly: monthlyRevenue },
        customers: {
          total: totalCustomers,
          new: newCustomers,
          retention: repeatCustomerRate,
          segments: customerSegments,
          avgReservationsPerCustomer,
          topCustomers: profiles.slice(0, 5).map(p => ({
            id: p.id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown Customer',
            reservations: reservations.filter(r => r.user_id === p.id).length,
            totalSpent: 0
          }))
        },
        reservations: {
          total: totalReservations,
          conversion: 15,
          peakHours,
          cancellationRate,
          avgPartySize: 3.2
        },
        performance: {
          avgResponseTime: 250,
          uptime: 99.9,
          errorRate: 0.05,
          satisfaction: 4.7,
          totalRestaurants: restaurants.length,
          activeReservations: reservations.filter(r => r.status === 'pending').length
        },
        metrics,
        goals
      };
    }
  });
}
