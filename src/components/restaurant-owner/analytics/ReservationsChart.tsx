
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { processReservationsByDate } from './utils';
import { CHART_CONFIG } from './constants';
import { Reservation } from '@/api/types';

interface ReservationsChartProps {
  reservationsData: Reservation[];
  timeRange: 'week' | 'month' | 'year';
}

export function ReservationsChart({ reservationsData, timeRange }: ReservationsChartProps) {
  const reservationsByDate = processReservationsByDate(reservationsData, timeRange);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservations Over Time</CardTitle>
        <CardDescription>
          Number of reservations by date
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {reservationsByDate.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={reservationsByDate}
              margin={CHART_CONFIG.margin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Reservations" 
                stroke="#4F46E5" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No reservation data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
