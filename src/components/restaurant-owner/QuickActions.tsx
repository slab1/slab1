
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu, CalendarDays, Settings } from "lucide-react";

interface QuickActionsProps {
  onAddMenuItems: () => void;
  onSetAvailability: () => void;
  onRestaurantSettings: () => void;
}

export const QuickActions = ({ 
  onAddMenuItems, 
  onSetAvailability, 
  onRestaurantSettings 
}: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to get your restaurant up and running</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2" 
          onClick={onAddMenuItems}
        >
          <Menu className="h-6 w-6" />
          <span>Add Menu Items</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2" 
          onClick={onSetAvailability}
        >
          <CalendarDays className="h-6 w-6" />
          <span>Set Availability</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2" 
          onClick={onRestaurantSettings}
        >
          <Settings className="h-6 w-6" />
          <span>Restaurant Settings</span>
        </Button>
      </CardContent>
    </Card>
  );
};
