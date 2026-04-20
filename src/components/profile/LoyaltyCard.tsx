
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Award, Gift, Clock, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { loyaltyApi } from '@/api/loyalty';
import { LoyaltyPoints, LoyaltyReward, LoyaltyTransaction } from '@/api/types';

interface LoyaltyCardProps {
  standalone?: boolean;
}

export function LoyaltyCard({ standalone = false }: LoyaltyCardProps) {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints & { transaction_history?: LoyaltyTransaction[] } | null>(null);
  const [availableRewards, setAvailableRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  // Calculate tier progress
  const tierThresholds = {
    Bronze: { current: 0, next: 200, nextTier: 'Silver' },
    Silver: { current: 200, next: 500, nextTier: 'Gold' },
    Gold: { current: 500, next: 1000, nextTier: 'Platinum' },
    Platinum: { current: 1000, next: 1000, nextTier: 'Platinum' } // No more tiers after platinum
  };
  
  const getTierProgress = (points: number, tier: string) => {
    const tierInfo = (tierThresholds as any)[tier];
    if (!tierInfo) return 100;
    
    if (tier === 'Platinum') return 100;
    
    const progress = ((points - tierInfo.current) / (tierInfo.next - tierInfo.current)) * 100;
    return Math.min(Math.max(0, progress), 100);
  };

  useEffect(() => {
    const loadLoyaltyData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const pointsData = await loyaltyApi.getUserPointsWithHistory(user.id);
        const rewards = await loyaltyApi.getAvailableRewards();
        
        setLoyaltyData(pointsData || { id: '', user_id: user.id, points: 0, lifetime_points: 0, tier: 'Bronze', created_at: '', updated_at: '' });
        setAvailableRewards(rewards);
      } catch (error) {
        console.error("Error loading loyalty data:", error);
        toast.error("Failed to load loyalty information");
      } finally {
        setLoading(false);
      }
    };
    
    loadLoyaltyData();
  }, [user]);

  const handleRedeemReward = async (rewardId: string) => {
    if (!user || !loyaltyData) return;
    
    setRedeeming(true);
    try {
      const result = await loyaltyApi.redeemReward(user.id, rewardId);
      if (result.success) {
        // Refresh data
        const pointsData = await loyaltyApi.getUserPointsWithHistory(user.id);
        setLoyaltyData(pointsData);
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
    } finally {
      setRedeeming(false);
    }
  };

  // For demo/testing purposes only
  const handleAddTestPoints = async () => {
    if (!user) return;
    await loyaltyApi.addPoints(user.id, 50, "Test points");
    // Refresh data
    const pointsData = await loyaltyApi.getUserPointsWithHistory(user.id);
    setLoyaltyData(pointsData);
  };

  if (loading) {
    return (
      <Card className={`${standalone ? 'max-w-md mx-auto' : ''}`}>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>Loading your loyalty status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!loyaltyData) {
    return (
      <Card className={`${standalone ? 'max-w-md mx-auto' : ''}`}>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>Sign in to view your loyalty status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tierColors = {
    Bronze: 'text-amber-600',
    Silver: 'text-slate-400',
    Gold: 'text-yellow-400',
    Platinum: 'text-purple-500'
  };

  const tierProgress = getTierProgress(loyaltyData.points, loyaltyData.tier);
  const currentTierInfo = (tierThresholds as any)[loyaltyData.tier];
  const tierBenefits = loyaltyApi.getTierBenefits();

  return (
    <Card className={`${standalone ? 'max-w-md mx-auto' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Loyalty Status</CardTitle>
            <CardDescription>Earn points with every purchase</CardDescription>
          </div>
          <Badge className="text-lg py-1.5" variant="outline">
            <Award className={`h-5 w-5 mr-1 ${(tierColors as any)[loyaltyData.tier]}`} />
            <span className={`font-bold ${(tierColors as any)[loyaltyData.tier]}`}>{loyaltyData.tier}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center py-2 bg-muted/30 rounded-lg">
          <div className="text-3xl font-bold">{loyaltyData.points}</div>
          <div className="text-muted-foreground text-sm">points available</div>
        </div>
        
        {loyaltyData.tier !== 'Platinum' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Progress to {currentTierInfo.nextTier}</span>
              <span className="font-medium">{loyaltyData.points} / {currentTierInfo.next}</span>
            </div>
            <Progress value={tierProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Earn {currentTierInfo.next - loyaltyData.points} more points to reach {currentTierInfo.nextTier}
            </p>
          </div>
        )}
        
        <Separator />
        
        <div>
          <h3 className="font-semibold flex items-center mb-3">
            <Gift className="h-4 w-4 mr-1.5" />
            Available Rewards
          </h3>
          
          <div className="space-y-3">
            {availableRewards.length > 0 ? (
              availableRewards.map(reward => (
                <div key={reward.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{reward.name}</div>
                    <div className="text-sm text-muted-foreground">{reward.description}</div>
                    <div className="text-xs mt-1 flex items-center">
                      <Star className="h-3 w-3 mr-1 text-amber-500" />
                      {reward.points_required} points
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={loyaltyData.points < reward.points_required || redeeming}
                    onClick={() => handleRedeemReward(reward.id)}
                  >
                    Redeem
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No rewards available at the moment.</p>
            )}
          </div>
        </div>
        
        {loyaltyData.transaction_history && loyaltyData.transaction_history.length > 0 && (
          <>
            <Separator />
            
            <div>
              <Button 
                variant="link" 
                onClick={() => setShowTransactions(!showTransactions)} 
                className="p-0 h-auto"
              >
                <Clock className="h-4 w-4 mr-1.5" />
                {showTransactions ? "Hide" : "Show"} Transaction History
              </Button>
              
              {showTransactions && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {loyaltyData.transaction_history.map(transaction => (
                    <div key={transaction.id} className="text-sm flex justify-between p-2 border-b">
                      <span>{transaction.description}</span>
                      <span className={`font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        
        {/* For testing only - remove in production */}
        {process.env.NODE_ENV !== 'production' && (
          <Button variant="outline" size="sm" onClick={handleAddTestPoints} className="w-full">
            <TrendingUp className="h-4 w-4 mr-1.5" />
            Add Test Points (+50)
          </Button>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 text-xs text-muted-foreground">
        <p>Earn 10 points for every $1 spent at our restaurants.</p>
        <p>Points expire after 12 months of inactivity.</p>
      </CardFooter>
    </Card>
  );
}
