
import { Calendar, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface Redemption {
  id: string;
  points_used: number;
  created_at: string;
  reward?: {
    name: string;
    description?: string;
  };
}

interface RedemptionHistoryProps {
  redemptionHistory: Redemption[];
}

export function RedemptionHistory({ redemptionHistory }: RedemptionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Redemption History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {redemptionHistory.map((redemption) => (
            <div key={redemption.id} className="flex items-start border-b pb-4 last:border-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium">{redemption.reward?.name || "Reward"}</h4>
                  <span className="text-sm font-medium">
                    -{redemption.points_used} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(redemption.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
