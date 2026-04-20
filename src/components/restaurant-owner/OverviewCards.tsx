
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Menu, CreditCard, Utensils } from "lucide-react";

interface OverviewStats {
  reservations: number;
  menuItems: number;
  revenue: number;
  rating: number | null;
}

interface OverviewCardsProps {
  stats: OverviewStats;
}

export const OverviewCards = ({ stats }: OverviewCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reservations}</div>
          <p className="text-xs text-muted-foreground">
            {stats.reservations === 0 ? "No reservations yet" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
          <Menu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.menuItems}</div>
          <p className="text-xs text-muted-foreground">
            {stats.menuItems === 0 ? "No menu items yet" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.revenue === 0 ? "No revenue yet" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rating</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.rating !== null ? stats.rating.toFixed(1) : '-'}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.rating === null ? "No reviews yet" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
