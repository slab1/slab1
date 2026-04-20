
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus } from "lucide-react";
import { SubscriptionStatusCard } from '@/components/partnership/SubscriptionStatusCard';
import { PartnerSubscription } from "@/api/types";

interface NoSubscriptionStateProps {
  subscription: PartnerSubscription;
  onUpgrade: () => void;
  onManage: () => void;
}

export const NoSubscriptionState = ({ 
  subscription, 
  onUpgrade, 
  onManage 
}: NoSubscriptionStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle>Subscription Required</CardTitle>
          <CardDescription>
            You need an active subscription to access the restaurant owner dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <SubscriptionStatusCard
            subscription={subscription}
            onUpgrade={onUpgrade}
            onManage={onManage}
          />
          <Button onClick={onUpgrade} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Start Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
