import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi, SubscriptionPlan } from '@/api/subscription';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  Users,
  MapPin,
  BarChart3,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function SubscriptionPlansTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionApi.getPlans(),
  });

  const createMutation = useMutation({
    mutationFn: (newPlan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) => 
      subscriptionApi.createPlan(newPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast({ title: "Success", description: "Subscription plan created successfully." });
      setIsDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create plan.", 
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<SubscriptionPlan> }) => 
      subscriptionApi.updatePlan(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast({ title: "Success", description: "Subscription plan updated successfully." });
      setIsDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update plan.", 
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast({ title: "Success", description: "Subscription plan deleted successfully." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete plan.", 
        variant: "destructive" 
      });
    }
  });

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const planData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price_monthly: parseFloat(formData.get('price_monthly') as string),
      price_yearly: parseFloat(formData.get('price_yearly') as string) || null,
      max_locations: parseInt(formData.get('max_locations') as string) || null,
      max_staff: parseInt(formData.get('max_staff') as string) || null,
      analytics_level: formData.get('analytics_level') as string,
      is_active: formData.get('is_active') === 'on',
      features: (formData.get('features') as string).split(',').map(f => f.trim()).filter(f => f !== ''),
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, updates: planData as any });
    } else {
      createMutation.mutate(planData as any);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Manage the different subscription tiers available for restaurant partners.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingPlan(null);
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
              <DialogDescription>
                Fill in the details for the subscription plan.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input id="name" name="name" defaultValue={editingPlan?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="analytics_level">Analytics Level</Label>
                  <select 
                    id="analytics_level" 
                    name="analytics_level" 
                    className="w-full h-10 px-3 py-2 border rounded-md"
                    defaultValue={editingPlan?.analytics_level || 'basic'}
                  >
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingPlan?.description || ''} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                  <Input id="price_monthly" name="price_monthly" type="number" step="0.01" defaultValue={editingPlan?.price_monthly} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_yearly">Yearly Price ($)</Label>
                  <Input id="price_yearly" name="price_yearly" type="number" step="0.01" defaultValue={editingPlan?.price_yearly || ''} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_locations">Max Locations (empty for unlimited)</Label>
                  <Input id="max_locations" name="max_locations" type="number" defaultValue={editingPlan?.max_locations || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_staff">Max Staff (empty for unlimited)</Label>
                  <Input id="max_staff" name="max_staff" type="number" defaultValue={editingPlan?.max_staff || ''} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma separated)</Label>
                <Textarea 
                  id="features" 
                  name="features" 
                  placeholder="Unlimited reservations, SMS notifications, etc."
                  defaultValue={editingPlan?.features?.join(', ') || ''} 
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="is_active" name="is_active" defaultChecked={editingPlan?.is_active ?? true} />
                <Label htmlFor="is_active">Plan is active and visible to partners</Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Monthly</TableHead>
              <TableHead>Yearly</TableHead>
              <TableHead>Limits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">
                  <div>{plan.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{plan.description}</div>
                </TableCell>
                <TableCell>${plan.price_monthly}/mo</TableCell>
                <TableCell>{plan.price_yearly ? `$${plan.price_yearly}/yr` : '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {plan.max_locations ? `${plan.max_locations} Locs` : 'Unlimited'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {plan.max_staff ? `${plan.max_staff} Staff` : 'Unlimited'}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {plan.analytics_level}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={plan.is_active ? "secondary" : "destructive"}>
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
