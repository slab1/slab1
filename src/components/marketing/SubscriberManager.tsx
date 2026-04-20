import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Mail, 
  Search, 
  UserPlus, 
  Trash2, 
  Download,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const subscriberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  source: z.string().default("manual"),
});

type SubscriberFormValues = z.infer<typeof subscriberSchema>;

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean | null;
  source: string | null;
  subscribed_at: string;
  restaurant_id: string | null;
}

export function SubscriberManager({ restaurantId }: { restaurantId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      email: "",
      name: "",
      source: "manual",
    },
  });

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["marketing-subscribers", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_subscribers")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Subscriber[];
    },
  });

  const addSubscriberMutation = useMutation({
    mutationFn: async (values: SubscriberFormValues) => {
      const { data, error } = await supabase
        .from("marketing_subscribers")
        .insert({
          restaurant_id: restaurantId,
          email: values.email,
          name: values.name || null,
          source: values.source,
          is_active: true,
          subscribed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-subscribers", restaurantId] });
      toast({
        title: "Subscriber added",
        description: "The subscriber has been successfully added to your list.",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding subscriber",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("marketing_subscribers")
        .update({ is_active: !is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-subscribers", restaurantId] });
      toast({
        title: "Status updated",
        description: "Subscriber status has been updated.",
      });
    },
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("marketing_subscribers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-subscribers", restaurantId] });
      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been removed from your list.",
        variant: "destructive",
      });
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[], action: 'delete' | 'activate' | 'deactivate' }) => {
    const query = supabase.from("marketing_subscribers");
      
      if (action === 'delete') {
        const { error } = await query.delete().in("id", ids);
        if (error) throw error;
      } else {
        const { error } = await query
          .update({ is_active: action === 'activate' })
          .in("id", ids);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["marketing-subscribers", restaurantId] });
      setSelectedSubscribers([]);
      toast({
        title: "Bulk action completed",
        description: `Successfully ${variables.action === 'delete' ? 'deleted' : variables.action === 'activate' ? 'activated' : 'deactivated'} ${variables.ids.length} subscribers.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk action failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const filteredSubscribers = subscribers?.filter((s) => {
    const matchesSearch = 
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = sourceFilter === "all" || s.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const uniqueSources = Array.from(new Set(subscribers?.map(s => s.source).filter(Boolean) || [])) as string[];

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredSubscribers) {
      setSelectedSubscribers(filteredSubscribers.map(s => s.id));
    } else {
      setSelectedSubscribers([]);
    }
  };

  const handleSelectSubscriber = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSubscribers(prev => [...prev, id]);
    } else {
      setSelectedSubscribers(prev => prev.filter(item => item !== id));
    }
  };

  const onSubmit = (values: SubscriberFormValues) => {
    addSubscriberMutation.mutate(values);
  };

  const exportSubscribers = () => {
    if (!filteredSubscribers || filteredSubscribers.length === 0) return;
    
    // Helper to escape CSV values
    const escapeCSV = (val: string | null) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ["Name", "Email", "Status", "Source", "Subscribed At"];
    const rows = filteredSubscribers.map((s) => [
      escapeCSV(s.name || "N/A"),
      escapeCSV(s.email),
      escapeCSV(s.is_active ? "Active" : "Inactive"),
      escapeCSV(s.source || "Unknown"),
      escapeCSV(format(new Date(s.subscribed_at), "yyyy-MM-dd")),
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_${restaurantId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Subscriber Management
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSubscribers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subscriber</DialogTitle>
                <DialogDescription>
                  Manually add a customer to your marketing list.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">Manual Entry</SelectItem>
                            <SelectItem value="website">Website Form</SelectItem>
                            <SelectItem value="reservation">Reservation</SelectItem>
                            <SelectItem value="promotion">Promotion Redemption</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={addSubscriberMutation.isPending}
                    >
                      {addSubscriberMutation.isPending ? "Adding..." : "Add Subscriber"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Your Marketing List</CardTitle>
              <CardDescription>
                Manage your {subscribers?.length || 0} subscribers and their engagement.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Sources" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedSubscribers.length > 0 && (
            <div className="flex items-center gap-2 pt-4 px-1 bg-muted/30 rounded-lg p-2 animate-in fade-in slide-in-from-top-1">
              <span className="text-sm font-medium ml-2">
                {selectedSubscribers.length} selected
              </span>
              <div className="flex-1" />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => bulkActionMutation.mutate({ ids: selectedSubscribers, action: 'activate' })}
                disabled={bulkActionMutation.isPending}
              >
                <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                Activate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => bulkActionMutation.mutate({ ids: selectedSubscribers, action: 'deactivate' })}
                disabled={bulkActionMutation.isPending}
              >
                <ShieldAlert className="h-4 w-4 mr-2 text-orange-600" />
                Deactivate
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscribers?`)) {
                    bulkActionMutation.mutate({ ids: selectedSubscribers, action: 'delete' });
                  }
                }}
                disabled={bulkActionMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredSubscribers && filteredSubscribers.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 transition-colors">
                      <th className="h-12 px-4 text-left align-middle font-medium w-10">
                        <Checkbox 
                          checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                          aria-label="Select all"
                        />
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Subscriber</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Source</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Joined</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr 
                        key={subscriber.id} 
                        className={`border-b transition-colors hover:bg-muted/50 ${selectedSubscribers.includes(subscriber.id) ? 'bg-muted/30' : ''}`}
                      >
                        <td className="p-4">
                          <Checkbox 
                            checked={selectedSubscribers.includes(subscriber.id)}
                            onCheckedChange={(checked) => handleSelectSubscriber(subscriber.id, !!checked)}
                            aria-label={`Select ${subscriber.email}`}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{subscriber.name || "Anonymous"}</span>
                            <span className="text-xs text-muted-foreground">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={subscriber.is_active ? "default" : "secondary"}
                            className="flex w-fit items-center gap-1"
                          >
                            {subscriber.is_active ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{subscriber.source || "direct"}</Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => toggleStatusMutation.mutate({ 
                                  id: subscriber.id, 
                                  is_active: !!subscriber.is_active 
                                })}
                              >
                                {subscriber.is_active ? (
                                  <><XCircle className="h-4 w-4 mr-2" /> Deactivate</>
                                ) : (
                                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Activate</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this subscriber?")) {
                                    deleteSubscriberMutation.mutate(subscriber.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No subscribers found</h3>
              <p className="text-muted-foreground">
                {searchTerm || sourceFilter !== "all" ? "Try adjusting your search or filters." : "Start building your audience today!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
