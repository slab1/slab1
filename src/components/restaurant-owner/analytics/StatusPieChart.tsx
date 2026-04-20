
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell,
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { processDataByStatus } from './utils';
import { COLORS } from './constants';
import { Reservation } from '@/api/types';

interface StatusPieChartProps {
  reservationsData: Reservation[];
}

export function StatusPieChart({ reservationsData }: StatusPieChartProps) {
  const reservationsByStatus = processDataByStatus(reservationsData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation Status</CardTitle>
        <CardDescription>
          Breakdown of reservation statuses
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {reservationsByStatus.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reservationsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {reservationsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No status data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
