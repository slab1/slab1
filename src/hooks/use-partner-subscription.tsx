
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { PartnerSubscription } from '@/api/types';

export const usePartnerSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<PartnerSubscription>({
    hasActiveSubscription: false,
    subscriptionStatus: null,
    planName: null,
    features: null,
    trialEndDate: null,
    subscriptionEndDate: null,
    maxLocations: null,
    maxStaff: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get partner data with subscription plan
      const response = await supabase
        .from('restaurant_partners')
        .select(`
          *,
          subscription_plans (
            name,
            features,
            max_locations,
            max_staff
          )
        `)
        .eq('user_id', user.id)
        .single();
      
      const { data: partnerData, error: partnerError } = response;

      if (partnerError && partnerError.code !== 'PGRST116') {
        throw partnerError;
      }

      if (!partnerData) {
        setSubscription({
          hasActiveSubscription: false,
          subscriptionStatus: null,
          planName: null,
          features: null,
          trialEndDate: null,
          subscriptionEndDate: null,
          maxLocations: null,
          maxStaff: null
        });
        return;
      }

      const now = new Date();
      const trialEnd = partnerData.trial_end_date ? new Date(partnerData.trial_end_date) : null;
      const subscriptionEnd = partnerData.subscription_end_date ? new Date(partnerData.subscription_end_date) : null;

      const hasActiveTrial = trialEnd && now < trialEnd && partnerData.subscription_status === 'trial';
      const hasActiveSubscription = subscriptionEnd && now < subscriptionEnd && partnerData.subscription_status === 'active';

      // Safely handle features from database
      let features: string[] | null = null;
      if (partnerData.subscription_plans?.features) {
        if (Array.isArray(partnerData.subscription_plans.features)) {
          features = partnerData.subscription_plans.features as string[];
        } else {
          // Handle case where features might be stored as a different format
          features = [];
        }
      }

      setSubscription({
        hasActiveSubscription: hasActiveTrial || hasActiveSubscription,
        subscriptionStatus: partnerData.subscription_status,
        planName: partnerData.subscription_plans?.name || null,
        features,
        trialEndDate: partnerData.trial_end_date,
        subscriptionEndDate: partnerData.subscription_end_date,
        maxLocations: partnerData.subscription_plans?.max_locations || null,
        maxStaff: partnerData.subscription_plans?.max_staff || null
      });

    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription status');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const refreshSubscription = () => {
    fetchSubscriptionStatus();
  };

  return {
    subscription,
    loading,
    error,
    refreshSubscription
  };
};
