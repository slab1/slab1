import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { reservationApi } from "@/api/reservation";
import { useAuth } from "@/hooks/use-auth";
import { isApiError } from "@/api/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { ReservationStatus } from "@/components/ReservationStatus";
import { formatDisplayDate, formatDisplayTime } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarDays, Clock, Users, MapPin, ArrowLeft, Phone, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ReservationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { 
    data: reservation, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["reservation", id],
    queryFn: async () => {
      if (!id) throw new Error("No reservation ID provided");
      return await reservationApi.getById(id);
    },
    enabled: !!id,
  });

  const handleCancel = async () => {
    if (!reservation || !id) return;
    
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      try {
        await reservationApi.cancel(id);
        toast.success("Reservation cancelled successfully");
        navigate("/reservations");
      } catch (error) {
        console.error("Error cancelling reservation:", error);
        toast.error("Failed to cancel reservation");
      }
    }
  };

  if (!user) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to view reservation details.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Container>
    );
  }

  if (error || (reservation && isApiError(reservation))) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : (reservation && isApiError(reservation)) 
        ? reservation.error 
        : "The reservation you're looking for doesn't exist or you don't have permission to view it.";

    return (
      <Container>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Reservation Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {errorMessage}
          </p>
          <Button onClick={() => navigate("/reservations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reservations
          </Button>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  // Handle API error response or missing reservation
  if (!reservation || isApiError(reservation)) {
    return (
      <Container>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Reservation Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The reservation you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/reservations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reservations
          </Button>
        </div>
      </Container>
    );
  }

  // Now reservation is properly typed as Reservation
  const res = reservation;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/reservations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reservations
          </Button>
        </div>

        <PageHeader 
          title="Reservation Details" 
          description={`Reservation ID: ${res.id?.slice(0, 8) || ''}...`}
        />

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  {res.restaurant?.name || "Restaurant"}
                </CardTitle>
                <CardDescription>
                  {(() => {
                    const loc = res.location;
                    if (!loc) return 'Location details unavailable';
                    
                    const city = (loc as any).city || '';
                    const state = (loc as any).state || '';
                    const zip = '';
                    
                    let street = '';
                    if (loc.address) {
                      if (typeof loc.address === 'object') {
                        street = (loc.address as any).street || '';
                      } else {
                        street = String(loc.address);
                      }
                    }
                    
                    const parts = [street, city, state, zip].filter(Boolean);
                    return parts.join(', ') || 'No address provided';
                  })()}
                </CardDescription>
              </div>
              <ReservationStatus status={res.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reservation Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDisplayDate(res.reservation_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDisplayTime(res.reservation_time)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Party Size</p>
                      <p className="text-sm text-muted-foreground">
                        {res.guest_count} {res.guest_count === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                  </div>

                  {res.table && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Table</p>
                        <p className="text-sm text-muted-foreground">
                          Table {res.table.table_number}
                          {res.table.section && ` (${res.table.section})`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Restaurant Contact</h3>
                
                <div className="space-y-3">
                  {(res.location as any)?.phone_number && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {(res.location as any).phone_number}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const loc = res.location;
                          if (!loc) return 'Address unavailable';
                          
                          const city = (loc as any).city || '';
                          const state = (loc as any).state || '';
                          const zip = '';
                          
                          let street = '';
                          if (loc.address) {
                            if (typeof loc.address === 'object') {
                              street = (loc.address as any).street || '';
                            } else {
                              street = String(loc.address);
                            }
                          }
                          
                          return (
                            <>
                              {street}<br />
                              {city}, {state} {zip}
                            </>
                          );
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {res.special_requests && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">Special Requests</h3>
                <p className="text-muted-foreground">
                  {res.special_requests}
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Created: {format(new Date(res.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
              
              <div className="flex gap-2">
                {res.status === "pending" && (
                  <Button variant="destructive" onClick={handleCancel}>
                    Cancel Reservation
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => {
                  const identifier = (res.restaurant as any)?.slug || res.restaurant?.id;
                  if (identifier) {
                    navigate(`/restaurants/${identifier}`);
                  } else {
                    navigate('/restaurants');
                  }
                }}>
                  Go to Restaurant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
