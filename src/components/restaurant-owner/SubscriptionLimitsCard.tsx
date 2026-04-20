import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePartnerSubscription } from "@/hooks/use-partner-subscription";
import { staffApi } from "@/api/staff";
import { Users, MapPin, Loader2 } from "lucide-react";

interface SubscriptionLimitsCardProps {
  restaurantCount: number;
}

export function SubscriptionLimitsCard({ restaurantCount }: SubscriptionLimitsCardProps) {
  const { subscription: partnerSubscription, loading: subLoading } = usePartnerSubscription();
  const [staffCount, setStaffCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const allStaff = await staffApi.getAll();
        setStaffCount(allStaff.length);
      } catch (error) {
        console.error("Error fetching staff count:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  if (subLoading || loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const staffLimit = partnerSubscription?.maxStaff || 0;
  const locationLimit = partnerSubscription?.maxLocations || 0;

  const staffUsage = staffLimit > 0 ? (staffCount || 0) / staffLimit * 100 : 0;
  const locationUsage = locationLimit > 0 ? restaurantCount / locationLimit * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Subscription Limits</CardTitle>
        <CardDescription>
          Your current plan: <span className="font-semibold text-primary">{partnerSubscription?.planName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Locations</span>
            </div>
            <span className="font-medium">
              {restaurantCount} / {locationLimit === -1 ? "∞" : locationLimit}
            </span>
          </div>
          <Progress value={locationLimit === -1 ? 0 : locationUsage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Staff Members</span>
            </div>
            <span className="font-medium">
              {staffCount} / {staffLimit === -1 ? "∞" : staffLimit}
            </span>
          </div>
          <Progress value={staffLimit === -1 ? 0 : staffUsage} className="h-2" />
        </div>

        {((locationUsage > 80 && locationLimit !== -1) || (staffUsage > 80 && staffLimit !== -1)) && (
          <p className="text-xs text-amber-600 font-medium">
            You are approaching your plan limits. Consider upgrading for more capacity.
          </p>
        )}
      </CardContent>
    </Card>
  );
}