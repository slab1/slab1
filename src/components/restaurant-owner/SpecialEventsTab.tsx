
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { specialEventApi } from '@/api/specialEvent';
import { inventoryApi } from '@/api/inventory';
import { SpecialEvent } from '@/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  MoreHorizontal,
  Eye,
  Sparkles,
  DollarSign,
  ShoppingCart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { NotificationService } from '@/services/notification-service';
import { SpecialEventOrderDialog } from './SpecialEventOrderDialog';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SpecialEventsTabProps {
  restaurantId?: string;
}

export function SpecialEventsTab({ restaurantId }: SpecialEventsTabProps) {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<SpecialEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [editDetails, setEditDetails] = useState({
    quote_estimate: 0,
    deposit_amount: 0,
    internal_notes: ''
  });

  // Update editDetails when selectedEvent changes
  React.useEffect(() => {
    if (selectedEvent) {
      setEditDetails({
        quote_estimate: selectedEvent.quote_estimate || 0,
        deposit_amount: selectedEvent.deposit_amount || 0,
        internal_notes: selectedEvent.internal_notes || ''
      });
    }
  }, [selectedEvent]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['restaurant-special-events', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      return await specialEventApi.getByRestaurantId(restaurantId);
    },
    enabled: !!restaurantId,
  });

  const filteredEvents = events.filter(event => 
    statusFilter === 'all' || event.status === statusFilter
  );

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const result = await specialEventApi.updateStatus(id, status);
      
      // If marked as completed, deplete inventory
      if (status === 'completed') {
        const success = await inventoryApi.depleteFromSpecialEvent(id);
        if (!success) {
          throw new Error('Failed to deplete inventory stock');
        }
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-special-events', restaurantId] });
      
      // Trigger notification for status change
      NotificationService.notifySpecialEventStatusChange(variables.id, variables.status);

      if (variables.status === 'completed') {
        toast.success('Event marked as completed and inventory stock updated');
      } else {
        toast.success('Event status updated');
      }
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + (error as Error).message);
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string, paymentStatus: string }) => 
      specialEventApi.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-special-events', restaurantId] });
      toast.success('Payment status updated');
    },
    onError: (error) => {
      toast.error('Failed to update payment status: ' + (error as Error).message);
    }
  });

  const updateDetailsMutation = useMutation({
    mutationFn: ({ id, details }: { id: string, details: { quote_estimate?: number, deposit_amount?: number, internal_notes?: string } }) => 
      specialEventApi.updateDetails(id, details),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-special-events', restaurantId] });
      if (data) setSelectedEvent(data as unknown as SpecialEvent);
      toast.success('Event details updated');
    },
    onError: (error) => {
      toast.error('Failed to update details: ' + (error as Error).message);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'deposit_paid':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Deposit Paid</Badge>;
      case 'fully_paid':
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Fully Paid</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Unpaid</Badge>;
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading special events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          Special Event Requests
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredEvents.length} requests
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">No special event requests yet</p>
            <p className="text-sm text-muted-foreground">When customers book private events, they will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event & Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-bold">{event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}</div>
                        <div className="text-sm text-muted-foreground">{event.contact_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {"Default Location"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                        <span className="text-xs text-muted-foreground">{event.event_time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {event.guest_count}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>{getPaymentBadge(event.payment_status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedEvent(event)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {event.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                className="text-green-600"
                                onClick={() => updateStatusMutation.mutate({ id: event.id, status: 'confirmed' })}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Event
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => updateStatusMutation.mutate({ id: event.id, status: 'cancelled' })}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Event
                              </DropdownMenuItem>
                            </>
                          )}
                          {event.status === 'confirmed' && (
                            <DropdownMenuItem 
                              onClick={() => updateStatusMutation.mutate({ id: event.id, status: 'completed' })}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updatePaymentStatusMutation.mutate({ id: event.id, paymentStatus: 'unpaid' })}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Mark as Unpaid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updatePaymentStatusMutation.mutate({ id: event.id, paymentStatus: 'deposit_paid' })}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Mark as Deposit Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updatePaymentStatusMutation.mutate({ id: event.id, paymentStatus: 'fully_paid' })}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Mark as Fully Paid
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {selectedEvent && (
        <Card className="mt-8 border-amber-200 bg-amber-50/30">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Event Details: {selectedEvent.event_type.charAt(0).toUpperCase() + selectedEvent.event_type.slice(1)}</CardTitle>
                <CardDescription>Requested on {format(new Date(selectedEvent.created_at), 'PPP')}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Customer Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{selectedEvent.contact_name} ({selectedEvent.guest_count} guests)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${selectedEvent.contact_email}`} className="text-blue-600 hover:underline">{selectedEvent.contact_email}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${selectedEvent.contact_phone}`} className="text-blue-600 hover:underline">{selectedEvent.contact_phone}</a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Event Schedule</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{format(new Date(selectedEvent.event_date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{selectedEvent.event_time}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Special Services Requested</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedEvent.special_services).map(([key, value]) => (
                  <Badge 
                    key={key} 
                    variant={value ? "default" : "outline"}
                    className={cn(value ? "bg-amber-500" : "opacity-40")}
                  >
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedEvent.event_details && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Additional Details</h4>
                <p className="text-sm bg-background p-3 rounded border italic">"{selectedEvent.event_details}"</p>
              </div>
            )}

            {selectedEvent.dietary_requirements && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground text-destructive">Dietary Requirements</h4>
                <p className="text-sm bg-destructive/5 p-3 rounded border border-destructive/20">{selectedEvent.dietary_requirements}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 pt-6 border-t">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Internal Management</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="quote" className="text-xs">Est. Quote ($)</Label>
                      <Input 
                        id="quote"
                        type="number" 
                        value={editDetails.quote_estimate}
                        onChange={(e) => setEditDetails({...editDetails, quote_estimate: parseFloat(e.target.value) || 0})}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="deposit" className="text-xs">Required Deposit ($)</Label>
                      <Input 
                        id="deposit"
                        type="number" 
                        value={editDetails.deposit_amount}
                        onChange={(e) => setEditDetails({...editDetails, deposit_amount: parseFloat(e.target.value) || 0})}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="notes" className="text-xs">Internal Staff Notes</Label>
                    <Textarea 
                      id="notes"
                      placeholder="Add private notes about this event..."
                      value={editDetails.internal_notes}
                      onChange={(e) => setEditDetails({...editDetails, internal_notes: e.target.value})}
                      className="text-sm min-h-[80px]"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => updateDetailsMutation.mutate({ 
                      id: selectedEvent.id, 
                      details: editDetails 
                    })}
                    disabled={updateDetailsMutation.isPending}
                  >
                    {updateDetailsMutation.isPending ? "Saving..." : "Save Management Details"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Order & Inventory</h4>
                <div className="p-4 bg-background border rounded-lg flex flex-col items-center justify-center gap-3">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground opacity-40" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Event Menu Items</p>
                    <p className="text-xs text-muted-foreground">Link menu items to this event to track inventory and costs.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsOrderDialogOpen(true)}
                  >
                    Manage Order Items
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex items-center gap-4">
                <div className="text-center p-3 bg-background border rounded-lg">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Est. Quote</div>
                  <div className="text-lg font-bold text-primary">${selectedEvent.quote_estimate?.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-background border rounded-lg">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Deposit</div>
                  <div className="text-lg font-bold text-primary">${selectedEvent.deposit_amount?.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {selectedEvent.status === 'pending' && (
                  <>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatusMutation.mutate({ id: selectedEvent.id, status: 'confirmed' })}
                    >
                      Approve & Confirm
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => updateStatusMutation.mutate({ id: selectedEvent.id, status: 'cancelled' })}
                    >
                      Decline
                    </Button>
                  </>
                )}
                {selectedEvent.status === 'confirmed' && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => updateStatusMutation.mutate({ id: selectedEvent.id, status: 'completed' })}
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedEvent && (
        <SpecialEventOrderDialog
          eventId={selectedEvent.id}
          restaurantId={restaurantId || ''}
          isOpen={isOrderDialogOpen}
          onClose={() => setIsOrderDialogOpen(false)}
        />
      )}
    </div>
  );
}
