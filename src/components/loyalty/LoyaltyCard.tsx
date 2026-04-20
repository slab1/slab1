
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Award, Gift, TrendingUp, Check, Shield, 
  History, ChevronDown, ChevronUp, Star, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loyaltyApi, LoyaltyReward, LoyaltyTransaction } from "@/api/loyalty";
import { LoyaltyPoints } from "@/api/types";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoyaltyCard() {
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(0);
  const [tier, setTier] = useState<string>("Bronze");
  const [loading, setLoading] = useState<boolean>(true);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<LoyaltyTransaction[]>([]);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!user) return;

    const fetchLoyaltyData = async () => {
      try {
        // Fetch user loyalty data
        const data = await loyaltyApi.getUserPointsWithHistory(user.id);
        if (data) {
          setPoints(data.points || 0);
          setTier(data.tier || "Bronze");
          setTransactionHistory(data.transaction_history || []);
        }

        // Fetch available rewards
        const rewardsData = await loyaltyApi.getRewards();
        setRewards(rewardsData || []);
      } catch (err) {
        console.error("Error loading loyalty data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, [user]);

  const handleRedeemReward = async (reward: LoyaltyReward) => {
    setSelectedReward(reward);
    setIsRedeemDialogOpen(true);
  };

  const confirmRedemption = async () => {
    if (!user || !selectedReward) return;
    
    try {
      const result = await loyaltyApi.redeemReward(user.id, selectedReward.id);
      
      if (result.success) {
        toast.success("Reward redeemed successfully!");
        if (result.newPointsBalance !== undefined) {
          setPoints(result.newPointsBalance);
          setTier(getTierFromPoints(result.newPointsBalance));
        }
        
        // Refresh transaction history
        if (user) {
          const updatedData = await loyaltyApi.getUserPointsWithHistory(user.id);
          if (updatedData && updatedData.transaction_history) {
            setTransactionHistory(updatedData.transaction_history);
          }
        }
      } else {
        toast.error("Failed to redeem reward");
      }
    } catch (err) {
      console.error("Error redeeming reward", err);
      toast.error("Failed to redeem reward");
    } finally {
      setIsRedeemDialogOpen(false);
    }
  };

  const getNextTier = () => {
    if (tier === "Bronze") return { name: "Silver", points: 200 };
    if (tier === "Silver") return { name: "Gold", points: 500 };
    if (tier === "Gold") return { name: "Platinum", points: 1000 };
    return { name: "Platinum", points: 1000 };
  };

  const getTierFromPoints = (points: number): string => {
    if (points >= 1000) return "Platinum";
    if (points >= 500) return "Gold";
    if (points >= 200) return "Silver";
    return "Bronze";
  };

  const getTierColor = () => {
    switch (tier) {
      case "Bronze": return "bg-amber-600";
      case "Silver": return "bg-slate-400";
      case "Gold": return "bg-yellow-500";
      case "Platinum": return "bg-purple-600";
    }
  };

  const getTierGradient = () => {
    switch (tier) {
      case "Bronze": return "from-amber-600/20 to-amber-600/5";
      case "Silver": return "from-slate-400/20 to-slate-400/5";
      case "Gold": return "from-yellow-500/20 to-yellow-500/5";
      case "Platinum": return "from-purple-600/20 to-purple-600/5";
    }
  };

  const getTierBenefits = () => {
    return loyaltyApi.getTierBenefits();
  };

  const nextTier = getNextTier();
  const progress = tier === "Platinum" ? 100 : (points / nextTier.points) * 100;

  if (loading) {
    return (
      <Card className="border border-border/60 shadow-md">
        <CardHeader>
          <CardTitle className="h-8 w-48 bg-muted animate-pulse rounded"></CardTitle>
          <CardDescription className="h-4 w-32 bg-muted animate-pulse rounded"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-16 w-full bg-muted animate-pulse rounded"></div>
          <div className="h-24 w-full bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const tierBenefits = getTierBenefits();
  const currentTierBenefits = tierBenefits[tier as keyof typeof tierBenefits] || [];

  return (
    <>
      <Card className="border border-border/60 shadow-md overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getTierGradient()} pointer-events-none`}></div>
        <CardHeader className="relative">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Loyalty Program</CardTitle>
              <CardDescription className="mt-1">Earn points with every reservation</CardDescription>
            </div>
            <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-bold text-lg">{points}</span>
              <span className="ml-1 text-sm font-medium">points</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8 relative">
          <div className="bg-card/80 p-5 rounded-xl shadow-sm border border-border/40">
            <div className="flex justify-between mb-3">
              <div className="flex items-center">
                <div className={`${getTierColor()} text-white w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md`}>
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Current Tier</span>
                  <h3 className="text-xl font-bold">{tier}</h3>
                </div>
              </div>
              {tier !== "Platinum" && (
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Next Tier</span>
                  <h3 className="text-lg font-semibold">{nextTier.name}</h3>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {tier !== "Platinum" && (
                <div className="flex justify-between text-sm mb-1">
                  <span>{points} points</span>
                  <span>{nextTier.points} points</span>
                </div>
              )}
              <Progress value={progress} className="h-2.5" />
              {tier !== "Platinum" && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-primary mr-1.5" />
                  <span className="text-sm">
                    <span className="font-medium">{nextTier.points - points}</span> more points until {nextTier.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t">
              <h4 className="font-medium flex items-center">
                <Star className="h-4 w-4 mr-1.5 text-primary" />
                {tier} Benefits
              </h4>
              <ul className="mt-2 space-y-1.5">
                {currentTierBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <Check className="h-4 w-4 mr-1.5 mt-0.5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Gift className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Available Rewards</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm flex items-center"
              >
                <History className="h-4 w-4 mr-1.5" />
                {showHistory ? 'Hide History' : 'Show History'}
                {showHistory ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
              </Button>
            </div>
            
            {/* Transactions History */}
            {showHistory && (
              <div className="mb-6 bg-muted/30 rounded-xl p-4 border border-border/40">
                <h4 className="font-medium mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  Recent Transactions
                </h4>
                
                {transactionHistory.length > 0 ? (
                  <div className="space-y-2">
                    {transactionHistory.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0">
                        <div>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                          </span>
                          <p>{transaction.description}</p>
                        </div>
                        <div className={`font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-3">No transaction history yet</p>
                )}
              </div>
            )}
            
            <div className="grid gap-4">
              {rewards.length > 0 ? (
                rewards.map((reward) => (
                  <div 
                    key={reward.id} 
                    className="bg-card/80 flex justify-between items-center p-4 rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="font-semibold mb-1">{reward.name}</div>
                      <div className="text-sm text-muted-foreground">{reward.description}</div>
                    </div>
                    <div className="flex items-center">
                      <div className={`text-sm font-medium mr-4 px-3 py-1 rounded-full ${points >= reward.points_required ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {reward.points_required} pts
                      </div>
                      <Button
                        size="sm"
                        variant={points >= reward.points_required ? "default" : "outline"}
                        disabled={points < reward.points_required}
                        onClick={() => handleRedeemReward(reward)}
                        className="shadow-sm"
                      >
                        {points >= reward.points_required ? 
                          <><Check className="mr-1 h-4 w-4" /> Redeem</> : 
                          "Redeem"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <Alert variant="default" className="bg-muted/50">
                  <div className="text-center py-6">
                    <Gift className="mx-auto h-12 w-12 opacity-50 mb-3 text-muted-foreground" />
                    <AlertDescription className="text-muted-foreground">
                      No rewards available at the moment. Check back soon!
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/40 px-6 py-4 text-sm text-muted-foreground flex items-center justify-between border-t border-border/40 relative">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2 text-primary" />
            <span>Earn 10 points for each reservation and 1 point for every $5 spent</span>
          </div>
        </CardFooter>
      </Card>

      {/* Reward Redemption Confirmation Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="bg-muted/30 p-4 my-2 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="font-medium">{selectedReward.name}</div>
                <div className="font-bold text-primary">{selectedReward.points_required} pts</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{selectedReward.description}</p>
            </div>
          )}
          
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Your current balance: <span className="font-medium">{points} points</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Balance after redemption: <span className="font-medium">{points - (selectedReward?.points_required || 0)} points</span>
            </p>
          </div>
          
          <DialogFooter className="flex justify-between space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setIsRedeemDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRedemption}
              disabled={!selectedReward || points < selectedReward.points_required}
            >
              Confirm Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
