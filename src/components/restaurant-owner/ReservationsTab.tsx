import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { reservationApi } from "@/api/reservation";
import { locationApi } from "@/api/location";
import { inventoryApi } from "@/api/inventory";
import { Reservation, RestaurantLocation, RestaurantLocationAddress, Json } from "@/api/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, User, MapPin, AlertCircle, ShoppingCart, Loader2 } from "lucide-react";
import { formatDisplayDate, formatDisplayTime } from "@/lib/utils";
import { ReservationOrderDialog } from "./ReservationOrderDialog";
import { toast } from "sonner";

export function ReservationsTab({ restaurantId }: { restaurantId?: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<string>(restaurantId || "");
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      setSelectedLocation(restaurantId);
    }
  }, [restaurantId]);

  const { data: locations, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['restaurant-locations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const data = await locationApi.getByRestaurant(user.id);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user
  });

  const { data: reservations, isLoading: reservationsLoading, error: reservationsError } = useQuery({
    queryKey: ['location-reservations', selectedLocation],
    queryFn: async () => {
      if (!selectedLocation) return [];
      const data = await reservationApi.getByRestaurantId(selectedLocation);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedLocation
  });

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    setUpdatingStatus(reservationId);
    try {
      const success = await reservationApi.update(reservationId, { status: newStatus });
      if (success) {
        toast.success(`Status updated to ${newStatus}`);
        
        // If status is completed, trigger inventory depletion
        if (newStatus === 'completed') {
          const depletionSuccess = await inventoryApi.depleteFromReservation(reservationId);
          if (depletionSuccess) {
            toast.success("Inventory stock automatically updated based on order items");
          } else {
            toast.error("Failed to update inventory stock");
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['location-reservations'] });
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openOrderDialog = (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setOrderDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      seated: "outline",
      completed: "secondary",
      cancelled: "destructive",
      no_show: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatAddress = (address: RestaurantLocationAddress | string | Json) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null) {
      const addr = address as RestaurantLocationAddress;
      const parts = [addr.street, addr.city, addr.state].filter(Boolean);
      return parts.join(', ') || 'Unnamed Location';
    }
    return 'Unnamed Location';
  };

  if (locationsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-xs" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-full max-w-xs">
          <label className="text-sm font-medium mb-2 block">Filter by Location</label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {locations?.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{formatAddress(loc.address)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(locationsError || reservationsError) && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load data. Please try again later.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
          <CardDescription>
            {selectedLocation 
              ? `Showing reservations for the selected location` 
              : "Please select a location to view reservations"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedLocation ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No Location Selected</p>
              <p className="text-sm text-muted-foreground">Select a location from the dropdown above to view its reservations.</p>
            </div>
          ) : reservationsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !reservations || reservations.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No Reservations Found</p>
              <p className="text-sm text-muted-foreground">There are no reservations for this location at the moment.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Party Size</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {res.user?.first_name} {res.user?.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDisplayDate(res.reservation_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDisplayTime(res.reservation_time)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{res.guest_count} guests</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openOrderDialog(res.id)}
                          className="flex items-center gap-1"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Items
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {updatingStatus === res.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Select 
                              defaultValue={res.status} 
                              onValueChange={(val) => handleStatusChange(res.id, val)}
                              disabled={res.status === 'completed' || res.status === 'cancelled'}
                            >
                              <SelectTrigger className="h-8 w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="seated">Seated</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="no_show">No Show</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReservationId && (
        <ReservationOrderDialog 
          reservationId={selectedReservationId}
          restaurantId={selectedLocation}
          isOpen={orderDialogOpen}
          onClose={() => setOrderDialogOpen(false)}
        />
      )}
    </div>
  );
}
