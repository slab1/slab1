
import { Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoyaltyPoints } from "@/api/types";

interface LoyaltyPointsDisplayProps {
  loyaltyData: LoyaltyPoints;
}

export function LoyaltyPointsDisplay({ loyaltyData }: LoyaltyPointsDisplayProps) {
  const points = loyaltyData?.points || 0;
  const lifetimePoints = loyaltyData?.lifetime_points || points;
  
  // Determine next tier and progress based on lifetime points
  let nextTier = "";
  let nextTierPoints = 0;
  let progress = 0;
  
  if (lifetimePoints < 200) {
    nextTier = "Silver";
    nextTierPoints = 200;
    progress = (lifetimePoints / 200) * 100;
  } else if (lifetimePoints < 500) {
    nextTier = "Gold";
    nextTierPoints = 500;
    progress = ((lifetimePoints - 200) / 300) * 100;
  } else if (lifetimePoints < 1000) {
    nextTier = "Platinum";
    nextTierPoints = 1000;
    progress = ((lifetimePoints - 500) / 500) * 100;
  } else {
    nextTier = "Platinum";
    nextTierPoints = lifetimePoints;
    progress = 100;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Dining Rewards
        </CardTitle>
        <CardDescription>
          Earn points for every reservation and redeem them for exclusive rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{points} points</h3>
              <p className="text-sm text-muted-foreground">
                Current tier: {loyaltyData?.tier || "Bronze"}
              </p>
              {lifetimePoints > points && (
                <p className="text-xs text-muted-foreground mt-1">
                  Total earned: {lifetimePoints} pts
                </p>
              )}
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          {loyaltyData?.tier !== "Platinum" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier}</span>
                <span>{lifetimePoints} / {nextTierPoints} pts</span>
              </div>
              <Progress value={progress} />
              <p className="text-[10px] text-muted-foreground text-right italic">
                Based on total points earned
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Earn points</p>
              <div className="mt-1 font-semibold">10 pts per reservation</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Bonus points</p>
              <div className="mt-1 font-semibold">50 pts for reviews</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
