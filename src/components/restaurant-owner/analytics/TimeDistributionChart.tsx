
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { processDataByHour } from './utils';
import { CHART_CONFIG, COLORS } from './constants';
import { useState, useEffect } from 'react';
import { Reservation } from '@/api/types';

interface TimeDistributionChartProps {
  reservationsData: Reservation[];
}

// Custom tooltip to format the hour display
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const hour = parseInt(label);
    const formattedHour = hour === 12 ? '12PM' : 
                          hour === 0 ? '12AM' : 
                          hour < 12 ? `${hour}AM` : 
                          `${hour - 12}PM`;
    
    return (
      <div className="bg-background border rounded p-2 shadow-sm">
        <p className="font-medium">{formattedHour}</p>
        <p className="text-sm">{`Reservations: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Format X-axis hour ticks
const formatXAxis = (hour: number) => {
  if (hour === 0) return '12AM';
  if (hour === 12) return '12PM';
  return hour < 12 ? `${hour}AM` : `${hour-12}PM`;
};

export function TimeDistributionChart({ reservationsData }: TimeDistributionChartProps) {
  const [reservationsByHour, setReservationsByHour] = useState<{ hour: number; count: number }[]>([]);
  
  useEffect(() => {
    // Process data only when reservationsData changes
    if (Array.isArray(reservationsData) && reservationsData.length > 0) {
      const hourData = processDataByHour(reservationsData);
      setReservationsByHour(hourData);
    } else {
      // Set empty array if no valid data
      setReservationsByHour([]);
    }
  }, [reservationsData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservations by Time of Day</CardTitle>
        <CardDescription>
          Distribution of reservations across hours
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {reservationsByHour.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reservationsByHour}
              margin={CHART_CONFIG.margin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={formatXAxis} 
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Reservations" 
                fill={COLORS[0]} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No time of day data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
