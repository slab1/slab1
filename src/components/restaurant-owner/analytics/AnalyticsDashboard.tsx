
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCards } from './MetricsCards';
import { ReservationsChart } from './ReservationsChart';
import { PartySizePieChart } from './PartySizePieChart';
import { StatusPieChart } from './StatusPieChart';
import { TimeDistributionChart } from './TimeDistributionChart';
import { Reservation } from '@/api/types';

export type AnalyticsProps = {
  reservationsData: Reservation[];
  timeRange: 'week' | 'month' | 'year';
}

export function AnalyticsDashboard({ 
  reservationsData = [],
  timeRange = 'week'
}: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('reservations');
  
  // Calculate metrics for the MetricsCards component
  const totalReservations = reservationsData.length;
  const averagePartySize = totalReservations > 0 
    ? Math.round(reservationsData.reduce((sum, res) => sum + (res.guest_count || 0), 0) / totalReservations * 10) / 10 
    : 0;
  const pendingCount = reservationsData.filter(res => res.status === 'pending').length;
  const confirmedCount = reservationsData.filter(res => res.status === 'confirmed').length;
  
  return (
    <div className="space-y-6">
      <MetricsCards 
        totalReservations={totalReservations}
        pendingCount={pendingCount}
        confirmedCount={confirmedCount}
        averagePartySize={averagePartySize}
        reservationsData={reservationsData}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Analytics Insights</CardTitle>
          <CardDescription>
            Detailed visualization of your restaurant's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="reservations">Reservations Over Time</TabsTrigger>
              <TabsTrigger value="partySize">Party Sizes</TabsTrigger>
              <TabsTrigger value="status">Status Breakdown</TabsTrigger>
              <TabsTrigger value="timeOfDay">Time Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reservations" className="p-0">
              <ReservationsChart reservationsData={reservationsData} timeRange={timeRange} />
            </TabsContent>
            
            <TabsContent value="partySize" className="p-0">
              <PartySizePieChart reservationsData={reservationsData} />
            </TabsContent>
            
            <TabsContent value="status" className="p-0">
              <StatusPieChart reservationsData={reservationsData} />
            </TabsContent>
            
            <TabsContent value="timeOfDay" className="p-0">
              <TimeDistributionChart reservationsData={reservationsData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
