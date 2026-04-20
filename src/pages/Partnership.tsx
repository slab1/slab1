import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { PartnershipHero } from '@/components/partnership/PartnershipHero';
import { BusinessFeatures } from '@/components/partnership/BusinessFeatures';
import { PricingPlans } from '@/components/partnership/PricingPlans';
import { PartnerRegistrationForm } from '@/components/partnership/PartnerRegistrationForm';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_locations: number;
  max_staff: number;
  analytics_level: string;
  isPopular?: boolean;
}

export default function Partnership() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'hero' | 'plans' | 'registration'>('hero');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkExistingPartner = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('restaurant_partners' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data && !error) {
        toast.info('You are already registered as a partner. Redirecting to your dashboard...');
        navigate('/restaurant-owner');
      }
    };

    checkExistingPartner();
    fetchPlans();
  }, [user, navigate]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;

      // Transform database data to match our interface
      const plansWithPopular = data.map((plan, index) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly || 0,
        features: Array.isArray(plan.features) ? plan.features as string[] : [],
        max_locations: plan.max_locations || 1,
        max_staff: plan.max_staff || 10,
        analytics_level: plan.analytics_level || 'basic',
        isPopular: index === 1 // Mark the middle plan as popular
      }));

      setPlans(plansWithPopular);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    }
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/login?redirect=/partnership');
      return;
    }
    setCurrentStep('plans');
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinueToRegistration = () => {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }
    setCurrentStep('registration');
  };

  const handleRegistrationSubmit = async (data: any) => {
    if (!user || !selectedPlan) return;

    setLoading(true);
    try {
      // Calculate trial end date (14 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      // Create restaurant partner record
      const { error: partnerError } = await supabase
        .from('restaurant_partners')
        .insert({
          user_id: user.id,
          business_name: data.businessInfo.businessName,
          business_email: data.businessInfo.businessEmail,
          business_phone: data.businessInfo.business_phone_number,
          contact_name: data.businessInfo.contactName,
          business_license: data.businessInfo.businessLicense,
          tax_id: data.businessInfo.taxId,
          subscription_plan_id: selectedPlan,
          subscription_status: 'trial',
          trial_end_date: trialEndDate.toISOString(),
          address: {
            street: data.address.street,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
            country: data.address.country
          }
        });

      if (partnerError) throw partnerError;

      toast.success('Registration successful! Welcome to our partnership program.');
      navigate('/restaurant-owner');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPlans = () => {
    setCurrentStep('plans');
  };

  return (
    <div className="min-h-screen bg-white">
      {currentStep === 'hero' && (
        <>
          <PartnershipHero onGetStarted={handleGetStarted} />
          <BusinessFeatures />
        </>
      )}

      {currentStep === 'plans' && (
        <div className="py-16">
          <PricingPlans
            plans={plans}
            selectedPlan={selectedPlan}
            onSelectPlan={handleSelectPlan}
            billingPeriod={billingPeriod}
            onBillingPeriodChange={setBillingPeriod}
          />
          
          {selectedPlan && (
            <div className="text-center mt-8">
              <button
                onClick={handleContinueToRegistration}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
              >
                Continue to Registration
              </button>
            </div>
          )}
        </div>
      )}

      {currentStep === 'registration' && (
        <div className="py-16 px-4">
          <PartnerRegistrationForm
            selectedPlanId={selectedPlan}
            onSubmit={handleRegistrationSubmit}
            onBack={handleBackToPlans}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
