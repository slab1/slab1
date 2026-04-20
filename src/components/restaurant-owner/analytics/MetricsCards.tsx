
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, TrendingUp, Users } from "lucide-react";
import { processDataByHour } from './utils';
import { Reservation } from '@/api/types';

interface MetricsCardsProps {
  totalReservations: number;
  pendingCount: number;
  confirmedCount: number;
  averagePartySize: number;
  reservationsData: Reservation[];
}

export function MetricsCards({ 
  totalReservations, 
  pendingCount, 
  confirmedCount,
  averagePartySize,
  reservationsData
}: MetricsCardsProps) {
  // Calculate most popular hour
  const reservationsByHour = processDataByHour(reservationsData);
  
  // Initialize with default values
  let mostPopularHour = { hour: '', count: 0 };
  
  if (reservationsByHour.length) {
    // Find the hour with the most reservations
    const maxHourObject = reservationsByHour.reduce((max, current) => 
      current.count > max.count ? current : max, { hour: 0, count: 0 });
    
    // Format the hour for display (convert from number to formatted string)
    const hour = maxHourObject.hour;
    const formattedHour = hour === 0 ? '12 AM' : 
                          hour === 12 ? '12 PM' : 
                          hour < 12 ? `${hour} AM` : 
                          `${hour - 12} PM`;
                          
    mostPopularHour = { hour: formattedHour, count: maxHourObject.count };
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReservations}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {pendingCount > 0 && `${pendingCount} pending`}
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{confirmedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {confirmedCount > 0 && Math.round((confirmedCount / totalReservations) * 100)}% confirmation rate
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Party Size</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averagePartySize}</div>
          <p className="text-xs text-muted-foreground mt-1">
            people per reservation
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostPopularHour.hour}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {mostPopularHour.count} reservations at this hour
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
