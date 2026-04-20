
import { Gift } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoyaltyReward } from "@/api/types";

// Update the interface to match LoyaltyReward from api/types.ts
interface Reward {
  id: string;
  name: string;
  description?: string; // Make description optional to match LoyaltyReward
  points_required: number;
}

interface AvailableRewardsProps {
  rewards: Reward[];
  points: number;
  onRedeemReward: (rewardId: string) => void;
}

export function AvailableRewards({ rewards, points, onRedeemReward }: AvailableRewardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="h-5 w-5 mr-2 text-primary" />
          Available Rewards
        </CardTitle>
        <CardDescription>
          Redeem your points for these exclusive rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rewards && rewards.length > 0 ? (
          <div className="grid gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex-1">
                  <h4 className="font-medium">{reward.name}</h4>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <div className="font-semibold">{reward.points_required} pts</div>
                    <span className={`text-xs ${points >= reward.points_required ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {points >= reward.points_required ? "Available" : "Keep earning"}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={points < reward.points_required}
                    onClick={() => onRedeemReward(reward.id)}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No rewards available at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
