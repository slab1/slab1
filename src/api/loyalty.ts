import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { toast } from "sonner";
import { errorTracker } from "@/utils/error-tracking";
import { NotificationService } from "@/services/notification-service";

// Export types for use in components
export interface LoyaltyPoints {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  description: string | null;
  transaction_type: string;
  restaurant_id: string | null;
  program_id: string | null;
  created_at: string;
}

export interface LoyaltyRedemption {
  id: string;
  user_id: string;
  reward_id: string | null;
  points_used: number;
  created_at: string;
  reward?: LoyaltyReward;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const loyaltyApi = {
  /**
   * Get loyalty points for a user
   */
  getUserPoints: async (userId: string): Promise<LoyaltyPoints | null> => {
    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") { // No rows found
          return loyaltyApi.createUserPoints(userId);
        }
        throw error;
      }
      
      return {
        id: data.id,
        user_id: data.user_id,
        points: data.points,
        lifetime_points: data.lifetime_points ?? 0,
        tier: data.tier,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_user_points',
        userId
      });
      handleApiError(error);
      return null;
    }
  },

  /**
   * Create initial loyalty points for a user
   */
  createUserPoints: async (userId: string): Promise<LoyaltyPoints | null> => {
    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .insert([{
          user_id: userId,
          points: 0,
          lifetime_points: 0,
          tier: "Bronze"
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        user_id: data.user_id,
        points: data.points,
        lifetime_points: data.lifetime_points ?? 0,
        tier: data.tier,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'create_user_points',
        userId
      });
      handleApiError(error);
      return null;
    }
  },

  /**
   * Get loyalty points with transaction history
   */
  getUserPointsWithHistory: async (userId: string): Promise<LoyaltyPoints & { transaction_history: LoyaltyTransaction[] } | null> => {
    try {
      const pointsData = await loyaltyApi.getUserPoints(userId);
      
      if (!pointsData) return null;
      
      const { data: transactions, error: transactionError } = await supabase
        .from('loyalty_points_transactions')
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (transactionError) throw transactionError;
      
      return {
        ...pointsData,
        transaction_history: (transactions || []).map(t => ({
          id: t.id,
          user_id: t.user_id,
          points: t.points,
          description: t.description,
          transaction_type: t.transaction_type,
          restaurant_id: t.restaurant_id,
          program_id: t.program_id,
          created_at: t.created_at
        }))
      };
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_user_points_with_history',
        userId
      });
      handleApiError(error);
      return null;
    }
  },

  /**
   * Add points to a user's account
   */
  addPoints: async (userId: string, points: number, reason: string): Promise<boolean> => {
    try {
      const currentPoints = await loyaltyApi.getUserPoints(userId);
      
      if (!currentPoints) {
        throw new Error("User points not found");
      }
      
      const { error: pointsError } = await supabase
        .from('loyalty_points')
        .update({
          points: currentPoints.points + points,
          lifetime_points: (currentPoints.lifetime_points || 0) + points,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
      
      if (pointsError) throw pointsError;
      
      const { error: transactionError } = await supabase
        .from('loyalty_points_transactions')
        .insert([{
          user_id: userId,
          points,
          description: reason,
          restaurant_id: null,
          program_id: null,
          transaction_type: 'credit'
        }]);
      
      if (transactionError) throw transactionError;
      
      await loyaltyApi.checkAndUpdateTier(userId);
      await NotificationService.notifyLoyaltyPointsEarned(userId, points, reason);
      
      toast.success(`Added ${points} loyalty points!`);
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  /**
   * Check and update a user's loyalty tier based on their points
   */
  checkAndUpdateTier: async (userId: string): Promise<boolean> => {
    try {
      const points = await loyaltyApi.getUserPoints(userId);
      
      if (!points) return false;
      
      let newTier = points.tier;
      const tierBasis = points.lifetime_points || points.points;
      
      if (tierBasis >= 1000) {
        newTier = "Platinum";
      } else if (tierBasis >= 500) {
        newTier = "Gold";
      } else if (tierBasis >= 200) {
        newTier = "Silver";
      } else {
        newTier = "Bronze";
      }
      
      if (newTier !== points.tier) {
        const { error } = await supabase
          .from('loyalty_points')
          .update({
            tier: newTier,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);
        
        if (error) throw error;
        
        await NotificationService.notifyLoyaltyTierUpgraded(userId, newTier);
        
        if (newTier !== "Bronze") {
          toast.success(`Congratulations! You've been upgraded to ${newTier} tier!`);
        }
      }
      
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'check_and_update_tier',
        userId
      });
      return false;
    }
  },

  /**
   * Get available loyalty rewards
   */
  getAvailableRewards: async (): Promise<LoyaltyReward[]> => {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true });
      
      if (error) throw error;
      
      return (data || []) as LoyaltyReward[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_available_rewards'
      });
      handleApiError(error);
      return [];
    }
  },

  /**
   * Redeem a loyalty reward
   */
  redeemReward: async (userId: string, rewardId: string): Promise<{ success: boolean; newPointsBalance?: number }> => {
    try {
      // Use RPC function with type assertion for custom function
      const { data, error } = await (supabase.rpc as any)('redeem_loyalty_reward', {
        p_user_id: userId,
        p_reward_id: rewardId
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; message: string; new_points_balance?: number };
      
      if (!result.success) {
        toast.error(result.message);
        return { success: false };
      }
      
      toast.success(result.message);
      return { 
        success: true, 
        newPointsBalance: result.new_points_balance 
      };
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'redeem_reward',
        userId,
        rewardId
      });
      handleApiError(error);
      return { success: false };
    }
  },

  /**
   * Get user's redemption history
   */
  getUserRedemptionHistory: async (userId: string): Promise<LoyaltyRedemption[]> => {
    try {
      const { data, error } = await supabase
        .from('loyalty_redemptions')
        .select(`*, reward:reward_id(*)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        reward_id: row.reward_id,
        points_used: row.points_used,
        created_at: row.created_at,
        reward: row.reward,
      })) as LoyaltyRedemption[];
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'get_user_redemption_history',
        userId
      });
      handleApiError(error);
      return [];
    }
  },

  /**
   * Helper method for components that need rewards
   */
  getRewards: async (): Promise<LoyaltyReward[]> => {
    return loyaltyApi.getAvailableRewards();
  },

  /**
   * Get tier benefits for display
   */
  getTierBenefits: () => {
    return {
      Bronze: ["Earn base points", "Birthday bonus"],
      Silver: ["5% bonus points", "Special offers", "Priority reservations"],
      Gold: ["10% bonus points", "Free appetizer", "VIP service", "Priority waitlist"],
      Platinum: ["15% bonus points", "Free dessert", "Dedicated concierge", "Special events access"]
    };
  }
};
