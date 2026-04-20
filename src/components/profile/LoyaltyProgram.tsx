
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loyaltyApi } from "@/api/loyalty";
import { useAuth } from "@/hooks/use-auth";
import { Award, Gift, Calendar, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoyaltyPointsDisplay } from "./loyalty/LoyaltyPointsDisplay";
import { AvailableRewards } from "./loyalty/AvailableRewards";
import { RedemptionHistory } from "./loyalty/RedemptionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { LoyaltyReward } from "@/api/types";

export function LoyaltyProgram() {
  const { user } = useAuth();
  
  const {
    data: loyaltyData,
    isLoading: isLoadingLoyalty,
    refetch: refetchLoyalty,
    error: loyaltyError
  } = useQuery({
    queryKey: ["loyalty", user?.id],
    queryFn: () => loyaltyApi.getUserPoints(user?.id || ""),
    enabled: !!user
  });
  
  const {
    data: rewards,
    isLoading: isLoadingRewards,
    error: rewardsError
  } = useQuery({
    queryKey: ["loyalty-rewards"],
    queryFn: () => loyaltyApi.getAvailableRewards()
  });
  
  const {
    data: redemptionHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
    error: historyError
  } = useQuery({
    queryKey: ["loyalty-history", user?.id],
    queryFn: () => loyaltyApi.getUserRedemptionHistory(user?.id || ""),
    enabled: !!user
  });
  
  const handleRedeemReward = async (rewardId: string) => {
    if (!user) {
      toast.error("You need to be logged in to redeem rewards");
      return;
    }

    try {
      const result = await loyaltyApi.redeemReward(user.id, rewardId);

      if (result.success) {
        toast.success("Reward redeemed successfully!");
        refetchLoyalty();
        refetchHistory();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to redeem reward");
      }
    }
  };
  
  const isLoading = isLoadingLoyalty || isLoadingRewards || isLoadingHistory;
  const points = loyaltyData?.points || 0;

  // If there's no user, show a login prompt
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>
            Sign in to view and manage your loyalty points
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If we're loading, show a skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If there are errors, display an error message
  if (loyaltyError || rewardsError || historyError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>
            We encountered an error loading your loyalty information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-4">Please try again later</p>
            <Button 
              onClick={() => {
                refetchLoyalty();
                refetchHistory();
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <LoyaltyPointsDisplay loyaltyData={loyaltyData} />
      </ErrorBoundary>
      
      <ErrorBoundary>
        {/* Convert rewards to Reward[] type with null check */}
        <AvailableRewards 
          rewards={rewards?.map(reward => ({
            id: reward.id,
            name: reward.name,
            description: reward.description || '', // Provide default empty string for optional description
            points_required: reward.points_required
          })) || []} 
          points={points} 
          onRedeemReward={handleRedeemReward} 
        />
      </ErrorBoundary>
      
      {redemptionHistory && redemptionHistory.length > 0 && (
        <ErrorBoundary>
          <RedemptionHistory redemptionHistory={redemptionHistory} />
        </ErrorBoundary>
      )}
    </div>
  );
}
