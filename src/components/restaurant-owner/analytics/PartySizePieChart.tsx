
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell,
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { processDataByPartySize } from './utils';
import { COLORS } from './constants';
import { Reservation } from '@/api/types';

interface PartySizePieChartProps {
  reservationsData: Reservation[];
}

export function PartySizePieChart({ reservationsData }: PartySizePieChartProps) {
  const reservationsByPartySize = processDataByPartySize(reservationsData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservations by Party Size</CardTitle>
        <CardDescription>
          Distribution of different party sizes
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {reservationsByPartySize.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reservationsByPartySize}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {reservationsByPartySize.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No party size data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
