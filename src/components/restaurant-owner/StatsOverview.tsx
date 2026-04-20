
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils, 
  MapPin, 
  CalendarDays, 
  Clock, 
  TrendingUp, 
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface StatsOverviewProps {
  restaurantCount: number;
  locationCount: number;
  totalReservations: number;
  pendingReservations: number;
}

export function StatsOverview({
  restaurantCount,
  locationCount,
  totalReservations,
  pendingReservations
}: StatsOverviewProps) {
  const completedReservations = totalReservations - pendingReservations;
  const completionRate = totalReservations > 0 ? (completedReservations / totalReservations) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{restaurantCount}</div>
          <p className="text-xs text-muted-foreground">
            Active restaurant{restaurantCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Locations</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{locationCount}</div>
          <p className="text-xs text-muted-foreground">
            Total location{locationCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReservations}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {completionRate.toFixed(1)}% completion
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {pendingReservations}
            {pendingReservations > 0 ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {pendingReservations > 0 
              ? 'Require attention'
              : 'All caught up!'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
