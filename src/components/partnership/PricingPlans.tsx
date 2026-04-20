
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface Plan {
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

interface PricingPlansProps {
  plans: Plan[];
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
  billingPeriod: 'monthly' | 'yearly';
  onBillingPeriodChange: (period: 'monthly' | 'yearly') => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  billingPeriod,
  onBillingPeriodChange
}) => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose Your Perfect Plan
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Start with a 14-day free trial. No credit card required.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="bg-white p-1 rounded-lg">
              <Button
                variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                onClick={() => onBillingPeriodChange('monthly')}
                className="px-6"
              >
                Monthly
              </Button>
              <Button
                variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
                onClick={() => onBillingPeriodChange('yearly')}
                className="px-6"
              >
                Yearly
                <Badge variant="secondary" className="ml-2">Save 20%</Badge>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''} ${plan.isPopular ? 'border-blue-500' : ''}`}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${billingPeriod === 'monthly' ? plan.price_monthly : Math.round(plan.price_yearly / 12)}
                  </span>
                  <span className="text-gray-500">/month</span>
                  {billingPeriod === 'yearly' && (
                    <div className="text-sm text-gray-500">
                      Billed ${plan.price_yearly} yearly
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Button 
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full mb-6 ${selectedPlan === plan.id ? 'bg-blue-600' : ''}`}
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Up to {plan.max_locations === 999 ? 'Unlimited' : plan.max_locations} location{plan.max_locations !== 1 ? 's' : ''}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Up to {plan.max_staff === 999 ? 'Unlimited' : plan.max_staff} staff members
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {plan.analytics_level.charAt(0).toUpperCase() + plan.analytics_level.slice(1)} analytics
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};
