import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast, toast as toastFn } from "@/hooks/use-toast";
import { notificationsApi } from "@/api/notifications";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, ShieldCheck, RefreshCw, CreditCard, CheckCircle2, AlertTriangle, UserPlus, Trash2, History } from "lucide-react";
import { format, subDays, addMonths } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, X, Filter } from "lucide-react";

interface Plan {
  id: string;
  name: string;
}

interface Partner {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  contact_name: string;
  subscription_plan_id: string | null;
  subscription_status: string | null;
  onboarding_completed: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  user_id: string | null;
  created_at: string;
  subscription_plans?: Plan;
}

export const TestingPanel = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit Form states
  const [editPlanId, setEditPlanId] = useState("none");
  const [editStatus, setEditStatus] = useState("none");
  const [editOnboarding, setEditOnboarding] = useState(false);
  const [editTrialEnd, setEditTrialEnd] = useState("");
  const [editSubEnd, setEditSubEnd] = useState("");
  const [editUserId, setEditUserId] = useState("");
  
  // Create Form states
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlanId, setNewPlanId] = useState("none");
  
  const [updating, setUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: partnerData, error: partnerError } = await supabase
        .from('restaurant_partners')
        .select(`
          *,
          subscription_plans (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (partnerError) throw partnerError;
      setPartners(partnerData || []);

      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('id, name')
        .eq('is_active', true);

      if (planError) throw planError;
      setPlans(planData || []);
    } catch (error: any) {
      toastFn({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (partner: Partner) => {
    setSelectedPartner(partner);
    setEditPlanId(partner.subscription_plan_id || "none");
    setEditStatus(partner.subscription_status || "none");
    setEditOnboarding(!!partner.onboarding_completed);
    setEditTrialEnd(partner.trial_end_date ? partner.trial_end_date.split('T')[0] : "");
    setEditSubEnd(partner.subscription_end_date ? partner.subscription_end_date.split('T')[0] : "");
    setEditUserId(partner.user_id || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdatePartner = async () => {
    if (!selectedPartner) return;
    
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('restaurant_partners')
        .update({
          subscription_plan_id: editPlanId === "none" ? null : editPlanId,
          subscription_status: editStatus === "none" ? null : editStatus,
          onboarding_completed: editOnboarding,
          trial_end_date: editTrialEnd || null,
          subscription_end_date: editSubEnd || null,
          user_id: editUserId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPartner.id);

      if (error) throw error;

      toastFn({
        title: "Partner Updated",
        description: "The subscription details have been updated successfully.",
      });
      
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toastFn({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateTestPartner = async () => {
    try {
      setUpdating(true);
      if (!newBusinessName || !newEmail || newPlanId === "none") {
        toastFn({
          title: "Missing fields",
          description: "Please fill in all required fields for the test partner.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('restaurant_partners')
        .insert({
          business_name: newBusinessName,
          business_email: newEmail,
          business_phone: "+1555000000",
          contact_name: "Test User",
          subscription_plan_id: newPlanId,
          subscription_status: 'trial',
          trial_end_date: addMonths(new Date(), 1).toISOString(),
          onboarding_completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      toastFn({
        title: "Test Partner Created",
        description: `Successfully created test partner: ${newBusinessName}`,
      });
      
      setIsCreateDialogOpen(false);
      setNewBusinessName("");
      setNewEmail("");
      setNewPlanId("none");
      fetchData();
    } catch (error: any) {
      toastFn({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const simulatePayment = async (partner: Partner, success: boolean = true) => {
    try {
      setUpdating(true);
      const nextMonth = addMonths(new Date(), 1);
      
      const updateData = success ? {
        subscription_status: 'active',
        subscription_end_date: nextMonth.toISOString(),
        updated_at: new Date().toISOString()
      } : {
        subscription_status: 'expired',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('restaurant_partners')
        .update(updateData)
        .eq('id', partner.id);

      if (error) throw error;

      // Also create a notification for the partner user if linked
      if (partner.user_id) {
        await notificationsApi.createNotification({
          user_id: partner.user_id,
          type: success ? 'system_announcement' : 'reservation_cancelled',
          title: success ? 'Subscription Activated' : 'Payment Failed',
          message: success 
            ? `Your subscription for ${partner.business_name} is now active until ${nextMonth.toLocaleDateString()}.`
            : `We couldn't process the payment for ${partner.business_name}. Your subscription is now expired.`,
          read: false,
          data: { partner_id: partner.id }
        });
      }

      toastFn({
        title: success ? "Payment Simulated" : "Payment Failed Simulated",
        description: success 
          ? `Subscription set to active. ${partner.user_id ? 'Notification sent to user.' : 'No user linked to notify.'}` 
          : `Subscription set to expired. ${partner.user_id ? 'Notification sent to user.' : 'No user linked to notify.'}`,
        variant: success ? "default" : "destructive",
      });
      fetchData();
    } catch (error: any) {
      toastFn({
        title: "Simulation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const simulateTrialExpiry = async (partner: Partner) => {
    try {
      setUpdating(true);
      const yesterday = subDays(new Date(), 1);
      
      const { error } = await supabase
        .from('restaurant_partners')
        .update({
          subscription_status: 'expired',
          trial_end_date: yesterday.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id);

      if (error) throw error;

      // Also create a notification for the partner user if linked
      if (partner.user_id) {
        await notificationsApi.createNotification({
          user_id: partner.user_id,
          type: 'reservation_cancelled',
          title: 'Trial Period Expired',
          message: `Your trial period for ${partner.business_name} has expired. Please upgrade to continue using our services.`,
          read: false,
          data: { partner_id: partner.id }
        });
      }

      toastFn({
        title: "Trial Expiry Simulated",
        description: `Trial period set to expired. ${partner.user_id ? 'Notification sent to user.' : 'No user linked to notify.'}`,
        variant: "destructive",
      });
      fetchData();
    } catch (error: any) {
      toastFn({
        title: "Simulation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const activateAccount = async (partner: Partner) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('restaurant_partners')
        .update({
          subscription_status: 'active',
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id);

      if (error) throw error;

      // Also create a notification for the partner user if linked
      if (partner.user_id) {
        await notificationsApi.createNotification({
          user_id: partner.user_id,
          type: 'system_announcement',
          title: 'Account Activated',
          message: `Congratulations! Your account for ${partner.business_name} has been activated and onboarding is complete.`,
          read: false,
          data: { partner_id: partner.id }
        });
      }

      toastFn({
        title: "Account Activated",
        description: `Partner is now active and onboarding is complete. ${partner.user_id ? 'Notification sent to user.' : 'No user linked to notify.'}`,
      });
      fetchData();
    } catch (error: any) {
      toastFn({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePartner = async (partner: Partner) => {
    if (!confirm(`Are you sure you want to delete ${partner.business_name}?`)) return;
    
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('restaurant_partners')
        .delete()
        .eq('id', partner.id);

      if (error) throw error;

      toastFn({
        title: "Partner Deleted",
        description: "The partner account has been removed.",
      });
      fetchData();
    } catch (error: any) {
      toastFn({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const resetOnboarding = async (partner: Partner) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('restaurant_partners')
        .update({
          onboarding_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id);

      if (error) throw error;

      // Also create a notification for the partner user if linked
      if (partner.user_id) {
        await notificationsApi.createNotification({
          user_id: partner.user_id,
          type: 'system_announcement',
          title: 'Onboarding Reset',
          message: `Your onboarding process for ${partner.business_name} has been reset. Please complete the setup to activate your account.`,
          read: false,
          data: { partner_id: partner.id }
        });
      }

      toastFn({
        title: "Onboarding Reset",
        description: `Partner onboarding state has been reset. ${partner.user_id ? 'Notification sent to user.' : 'No user linked to notify.'}`,
      });
      fetchData();
    } catch (error: any) {
      toastFn({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">None</Badge>;
    
    switch (status) {
      case 'active': return <Badge className="bg-green-500">Active</Badge>;
      case 'trial': return <Badge className="bg-blue-500">Trial</Badge>;
      case 'expired': return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled': return <Badge variant="outline">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = 
      (partner.business_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (partner.business_email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (partner.user_id?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || partner.subscription_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Admin Testing Panel</h2>
          <p className="text-muted-foreground">
            Simulate subscription scenarios and manage partner accounts for testing
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Test Partner
          </Button>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search partners..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Partners ({filteredPartners.length})</CardTitle>
          <CardDescription>
            Manage and test subscription states for registered partners
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trial End</TableHead>
                    <TableHead>Sub End</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No partners found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPartners.map((partner) => (
                      <TableRow key={partner.id} className="group hover:bg-slate-50/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{partner.business_name || 'N/A'}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {partner.business_email}
                            </span>
                            <div className="text-[10px] text-indigo-500 font-mono mt-0.5">
                              {partner.user_id ? `UID: ${partner.user_id.substring(0, 12)}...` : '⚠️ No User Linked'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{partner.subscription_plans?.name || 'No Plan'}</TableCell>
                        <TableCell>{getStatusBadge(partner.subscription_status)}</TableCell>
                        <TableCell className="text-xs">
                          {partner.trial_end_date ? format(new Date(partner.trial_end_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {partner.subscription_end_date ? format(new Date(partner.subscription_end_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-green-50"
                                    onClick={() => simulatePayment(partner, true)}
                                    disabled={updating}
                                    title="Simulate Success Payment"
                                  >
                                    <CreditCard className="h-4 w-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Simulate Success Payment</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-orange-50"
                                    onClick={() => simulatePayment(partner, false)}
                                    disabled={updating}
                                    title="Simulate Failed Payment"
                                  >
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Simulate Failed Payment</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-blue-50"
                                    onClick={() => simulateTrialExpiry(partner)}
                                    disabled={updating}
                                    title="Simulate Trial Expiry"
                                  >
                                    <History className="h-4 w-4 text-blue-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Simulate Trial Expiry</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="h-8 w-8 hover:bg-indigo-50"
                                     onClick={() => activateAccount(partner)}
                                     disabled={updating}
                                     title="Activate Account & Complete Onboarding"
                                   >
                                     <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                   </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>Full Activation (Onboarding + Active)</TooltipContent>
                               </Tooltip>

                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="h-8 w-8 hover:bg-yellow-50"
                                     onClick={() => resetOnboarding(partner)}
                                     disabled={updating}
                                     title="Reset Onboarding State"
                                   >
                                     <RefreshCw className="h-4 w-4 text-yellow-600" />
                                   </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>Reset Onboarding State</TooltipContent>
                               </Tooltip>

                              <div className="w-px h-4 bg-slate-200 self-center mx-1" />

                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleEditClick(partner)}
                                disabled={updating}
                              >
                                Edit
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-red-50"
                                onClick={() => handleDeletePartner(partner)}
                                disabled={updating}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Test Partner</DialogTitle>
            <DialogDescription>
              Add a new partner account for testing purposes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newName">Business Name</Label>
              <Input 
                id="newName" 
                placeholder="e.g. Test Bistro" 
                value={newBusinessName} 
                onChange={(e) => setNewBusinessName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newEmail">Business Email</Label>
              <Input 
                id="newEmail" 
                type="email" 
                placeholder="test@example.com" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPlan">Initial Plan</Label>
              <Select value={newPlanId} onValueChange={setNewPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a plan</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTestPartner} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Partner Subscription</DialogTitle>
            <DialogDescription>
              Modify subscription details for {selectedPartner?.business_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">User ID (Link to Profile)</Label>
              <Input 
                id="userId" 
                placeholder="Paste Supabase User ID" 
                value={editUserId} 
                onChange={(e) => setEditUserId(e.target.value)} 
              />
              <p className="text-[10px] text-muted-foreground">
                Ensure this user exists in the system and has the appropriate role.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select value={editPlanId} onValueChange={setEditPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Plan</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="onboarding">Onboarding Completed</Label>
              <Switch 
                id="onboarding" 
                checked={editOnboarding} 
                onCheckedChange={setEditOnboarding} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Subscription Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Status</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trialEnd">Trial End Date</Label>
              <Input 
                id="trialEnd" 
                type="date" 
                value={editTrialEnd} 
                onChange={(e) => setEditTrialEnd(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subEnd">Subscription End Date</Label>
              <Input 
                id="subEnd" 
                type="date" 
                value={editSubEnd} 
                onChange={(e) => setEditSubEnd(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePartner} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
