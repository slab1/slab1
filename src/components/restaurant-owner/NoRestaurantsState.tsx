
import { Plus, Utensils, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SubscriptionStatusCard } from "@/components/partnership/SubscriptionStatusCard";
import { PartnerSubscription } from "@/api/types";

interface NoRestaurantsStateProps {
  subscription: PartnerSubscription;
  onUpgrade: () => void;
  onManage: () => void;
  hasPending?: boolean;
  hasRejected?: boolean;
}

export const NoRestaurantsState = ({ 
  subscription, 
  onUpgrade, 
  onManage,
  hasPending = false,
  hasRejected = false
}: NoRestaurantsStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your restaurant operations and settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SubscriptionStatusCard
          subscription={subscription}
          onUpgrade={onUpgrade}
          onManage={onManage}
        />
        
        <Card>
          <CardHeader className="text-center">
            {hasRejected ? (
              <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
            ) : hasPending ? (
              <Clock className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            ) : (
              <Utensils className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            )}
            <CardTitle>
              {hasRejected ? "Application Rejected" : hasPending ? "Application Pending" : "No Restaurants Found"}
            </CardTitle>
            <CardDescription>
              {hasRejected 
                ? "Your restaurant registration was not approved. Please contact support for more details."
                : hasPending 
                ? "Your restaurant registration is currently being reviewed by our team."
                : "Create your first restaurant to get started with the owner dashboard."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {hasRejected ? (
              <Button variant="outline" onClick={() => navigate("/contact-support")}>
                Contact Support
              </Button>
            ) : hasPending ? (
              <>
                <div className="text-left bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Next Steps</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Our team will verify your business details</li>
                    <li>You will receive an email once approved</li>
                    <li>In the meantime, prepare your menu and staff list</li>
                  </ul>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                  Check Status
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={() => navigate("/restaurant-registration")} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Restaurant
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
