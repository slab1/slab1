
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, History, User, CreditCard, Loader2 } from "lucide-react";
import { UserRole } from "@/api/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type UserWithRole = {
  id: string;
  user_id: string;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    is_active?: boolean;
  } | null;
};

interface UserDetailsDialogProps {
  user: UserWithRole;
  onViewDetails: (user: UserWithRole) => void;
  getRoleBadgeStyles: (role: UserRole | null) => string;
}

export function UserDetailsDialog({ user, onViewDetails, getRoleBadgeStyles }: UserDetailsDialogProps) {
  const queryClient = useQueryClient();
  
  const { data: activityLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["user-activity", user.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .or(`user_id.eq.${user.user_id},record_id.eq.${user.user_id}`)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user.user_id,
  });

  const { data: partnerData, isLoading: isLoadingPartner } = useQuery({
    queryKey: ["partner-subscription", user.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_partners")
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq("user_id", user.user_id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user.user_id,
  });

  const { data: allPlans } = useQuery({
    queryKey: ["subscription-plans-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true);
      
      if (error) throw error;
      return data;
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from("restaurant_partners")
        .update({ subscription_plan_id: planId })
        .eq("user_id", user.user_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-subscription", user.user_id] });
      toast.success("Subscription plan updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update plan: ${error.message}`);
    }
  });

  const isPartner = !!partnerData || (user.role === 'restaurant_owner' || user.role === 'restaurant_manager');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(user)}
        >
          <Eye className="h-4 w-4 mr-1" /> View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Management</DialogTitle>
          <DialogDescription>
            Detailed information and activity history for {user.profiles?.first_name || (user.role ? `${user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (No Profile)` : "this user")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className={`grid w-full ${isPartner ? "grid-cols-3" : "grid-cols-2"}`}>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Details
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <History className="h-4 w-4" /> Activity
            </TabsTrigger>
            {isPartner && (
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Subscription
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</h4>
                <p className="text-sm font-medium">
                  {user.profiles?.first_name || user.profiles?.last_name
                    ? `${user.profiles.first_name || ""} ${user.profiles.last_name || ""}`.trim()
                    : user.role 
                      ? `${user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (No Profile)`
                      : "Unknown User"}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</h4>
                <p className="text-sm font-medium">{user.profiles?.email || "No email available"}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Role</h4>
                <Badge
                  className={getRoleBadgeStyles(user.role)}
                  variant="outline"
                >
                  {user.role
                    ? user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : "No Role"}
                </Badge>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</h4>
                <Badge variant={user.is_active !== false ? "secondary" : "destructive"}>
                  {user.is_active !== false ? "Active" : "Deactivated"}
                </Badge>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Since</h4>
                <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Update</h4>
                <p className="text-sm">{new Date(user.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Internal ID</h4>
              <code className="text-[10px] bg-slate-100 p-1 rounded block truncate">
                {user.user_id}
              </code>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="py-4">
            <ScrollArea className="h-[300px] pr-4">
              {isLoadingLogs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-1 border-l-2 border-slate-200 pl-3 py-1">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {log.action}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-xs font-medium">
                        {log.table_name === 'user_roles' ? 'Role Change' : 
                         log.table_name === 'profiles' ? 'Profile Update' : 
                         log.table_name}
                      </p>
                      {log.new_values && (
                        <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded mt-1">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <History className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No recent activity found</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {isPartner && (
            <TabsContent value="subscription" className="py-4 space-y-6">
              {isLoadingPartner ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : partnerData ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">Current Subscription</h4>
                        <p className="text-xs text-slate-500">Plan: {partnerData.subscription_plans?.name || "No Plan"}</p>
                      </div>
                      <Badge variant={partnerData.subscription_status === 'active' ? "secondary" : "outline"}>
                        {partnerData.subscription_status || 'Unknown'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Max Locations</span>
                        <span className="font-medium">{partnerData.subscription_plans?.max_locations || "Unlimited"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Max Staff</span>
                        <span className="font-medium">{partnerData.subscription_plans?.max_staff || "Unlimited"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Trial Ends</span>
                        <span className="font-medium">
                          {partnerData.trial_end_date ? format(new Date(partnerData.trial_end_date), 'MMM d, yyyy') : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Subscription Ends</span>
                        <span className="font-medium">
                          {partnerData.subscription_end_date ? format(new Date(partnerData.subscription_end_date), 'MMM d, yyyy') : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="plan-select" className="text-sm font-semibold">Change Subscription Plan</Label>
                    <div className="flex gap-3">
                      <Select 
                        defaultValue={partnerData.subscription_plan_id} 
                        onValueChange={(value) => updatePlanMutation.mutate(value)}
                        disabled={updatePlanMutation.isPending}
                      >
                        <SelectTrigger id="plan-select" className="flex-1">
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {allPlans?.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} - ${plan.price_monthly}/mo
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatePlanMutation.isPending && (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      Changing the plan will immediately update the partner's limits and access.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No partner record found for this user.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={async () => {
                      // Logic to create partner record if needed
                      const { error } = await supabase
                        .from('restaurant_partners')
                        .insert([{ 
                          user_id: user.user_id, 
                          subscription_status: 'trialing',
                          business_name: `${user.profiles?.first_name || 'New'} ${user.profiles?.last_name || 'Partner'} Business`,
                          business_email: user.profiles?.email || ''
                        }] as any);
                      
                      if (error) toast.error("Failed to create partner record");
                      else queryClient.invalidateQueries({ queryKey: ["partner-subscription", user.user_id] });
                    }}
                  >
                    Create Partner Record
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
