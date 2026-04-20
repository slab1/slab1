import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, Phone, MessageSquare, CheckCircle, XCircle, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationService } from '@/services/notification-service';
import { WaitlistEntry } from '@/api/types';

interface WaitlistManagementProps {
  restaurantId: string;
}

export function WaitlistManagement({ restaurantId }: WaitlistManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    phoneNumber: '',
    party_size: 2,
    quoted_wait_time: 30,
    special_requests: ''
  });

  const queryClient = useQueryClient();

  const { data: waitlistEntries = [], isLoading } = useQuery({
    queryKey: ['waitlist', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'waiting')
        .order('join_time', { ascending: true });

      if (error) throw error;
      // Map DB columns to API types
      return (data || []).map(row => ({
        id: row.id,
        restaurant_id: row.restaurant_id,
        user_id: row.user_id,
        party_size: row.party_size,
        status: row.status as WaitlistEntry['status'],
        quoted_wait_time: row.quoted_wait_time,
        phone_number: row.phone_number,
        name: row.notes?.split('|')[0] || 'Guest', // Use notes field for name if needed
        special_requests: row.notes,
        join_time: row.join_time,
        estimated_wait_time: row.quoted_wait_time,
      })) as WaitlistEntry[];
    },
    enabled: !!restaurantId
  });

  const addToWaitlistMutation = useMutation({
    mutationFn: async (entry: typeof newEntry) => {
      const { data, error } = await supabase
        .from('waitlist')
        .insert([{
          restaurant_id: restaurantId,
          notes: `${entry.name}|${entry.special_requests}`, // Store name and requests in notes
          phone_number: entry.phoneNumber,
          party_size: entry.party_size,
          quoted_wait_time: entry.quoted_wait_time,
          status: 'waiting'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', restaurantId] });
      setIsAddDialogOpen(false);
      setNewEntry({
        name: '',
        phoneNumber: '',
        party_size: 2,
        quoted_wait_time: 30,
        special_requests: ''
      });
      toast.success('Added to waitlist successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add to waitlist: ' + error.message);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WaitlistEntry['status'] }) => {
      const updateData: Record<string, unknown> = { status };
      if (status === 'seated') {
        updateData.seated_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('waitlist')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', restaurantId] });
      
      // Trigger notification for status change
      NotificationService.notifyWaitlistStatusChange(variables.id, variables.status);

      const statusMsg = variables.status === 'seated' ? 'seated' : 
                       variables.status === 'cancelled' ? 'cancelled' : 'marked as no-show';
      toast.success(`Customer ${statusMsg} successfully`);
    },
    onError: (error: Error) => {
      toast.error('Failed to update waitlist: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToWaitlistMutation.mutate(newEntry);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'waiting': return 'default';
      case 'seated': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'no_show': return 'outline';
      default: return 'default';
    }
  };

  if (!restaurantId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Management</CardTitle>
          <CardDescription>No restaurant selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waitlist Management
          </span>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add to Waitlist</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Customer to Waitlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newEntry.phoneNumber}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="party_size">Party Size</Label>
                  <Input
                    id="party_size"
                    type="number"
                    min="1"
                    max="20"
                    value={newEntry.party_size}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, party_size: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="wait_time">Estimated Wait Time (minutes)</Label>
                  <Input
                    id="wait_time"
                    type="number"
                    min="5"
                    max="180"
                    value={newEntry.quoted_wait_time}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, quoted_wait_time: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="special_requests">Special Requests</Label>
                  <Textarea
                    id="special_requests"
                    value={newEntry.special_requests}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, special_requests: e.target.value }))}
                    placeholder="Any special accommodations..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addToWaitlistMutation.isPending}>
                    {addToWaitlistMutation.isPending ? 'Adding...' : 'Add to Waitlist'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Manage customer waitlist and seating
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : waitlistEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
            <p>No customers on waitlist</p>
            <p className="text-sm">Add customers as they arrive</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitlistEntries.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">#{index + 1} {entry.name || 'Anonymous'}</span>
                    <Badge variant={getStatusBadgeVariant(entry.status)}>
                      {entry.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {entry.phone_number}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {entry.party_size} people
                    </span>
                    {entry.quoted_wait_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~{entry.quoted_wait_time} min
                      </span>
                    )}
                  </div>
                  {entry.special_requests && (
                    <div className="flex items-start gap-1 mt-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mt-0.5" />
                      <span>{entry.special_requests}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => updateStatusMutation.mutate({ id: entry.id, status: 'seated' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Seat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => updateStatusMutation.mutate({ id: entry.id, status: 'no_show' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <UserX className="h-3.5 w-3.5 mr-1" />
                    No-show
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => updateStatusMutation.mutate({ id: entry.id, status: 'cancelled' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
