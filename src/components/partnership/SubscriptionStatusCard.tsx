
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Crown, AlertTriangle, CheckCircle } from "lucide-react";
import { format, differenceInDays } from 'date-fns';
import { PartnerSubscription } from '@/api/types';

interface SubscriptionStatusCardProps {
  subscription: PartnerSubscription;
  onUpgrade?: () => void;
  onManage?: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  subscription,
  onUpgrade,
  onManage
}) => {
  const getStatusBadge = () => {
    switch (subscription.subscriptionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Free Trial</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">No Subscription</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (subscription.hasActiveSubscription) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const getDaysRemaining = () => {
    const endDate = subscription.subscriptionStatus === 'trial' 
      ? subscription.trialEndDate 
      : subscription.subscriptionEndDate;
    
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const now = new Date();
    return Math.max(0, differenceInDays(end, now));
  };

  const daysRemaining = getDaysRemaining();
  const isNearExpiry = daysRemaining <= 7;

  return (
    <Card className={`${isNearExpiry && subscription.hasActiveSubscription ? 'border-yellow-200 bg-yellow-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Subscription Status</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {subscription.planName ? `Current Plan: ${subscription.planName}` : 'No active subscription'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {subscription.hasActiveSubscription && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {subscription.subscriptionStatus === 'trial' ? 'Trial ends' : 'Subscription ends'}
                </span>
              </div>
              <span className="text-sm font-medium">
                {format(new Date(
                  subscription.subscriptionStatus === 'trial' 
                    ? subscription.trialEndDate! 
                    : subscription.subscriptionEndDate!
                ), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Days remaining</span>
                <span className={isNearExpiry ? 'text-yellow-600 font-medium' : ''}>
                  {daysRemaining} days
                </span>
              </div>
              <Progress 
                value={(daysRemaining / (subscription.subscriptionStatus === 'trial' ? 14 : 30)) * 100} 
                className={isNearExpiry ? 'bg-yellow-100' : ''}
              />
            </div>

            {isNearExpiry && (
              <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {subscription.subscriptionStatus === 'trial' ? 'Trial Ending Soon' : 'Subscription Expiring'}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {subscription.subscriptionStatus === 'trial' 
                        ? 'Upgrade now to continue using all features'
                        : 'Renew your subscription to avoid service interruption'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {subscription.features && subscription.features.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Crown className="h-4 w-4 mr-1" />
              Included Features
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              {subscription.features.slice(0, 6).map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  {feature}
                </div>
              ))}
              {subscription.features.length > 6 && (
                <div className="text-gray-500">
                  +{subscription.features.length - 6} more features
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {subscription.subscriptionStatus === 'trial' || !subscription.hasActiveSubscription ? (
            <Button onClick={onUpgrade} className="flex-1">
              {subscription.subscriptionStatus === 'trial' ? 'Upgrade Plan' : 'Start Subscription'}
            </Button>
          ) : (
            <Button onClick={onManage} variant="outline" className="flex-1">
              Manage Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
