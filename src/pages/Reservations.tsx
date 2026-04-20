import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { reservationApi } from "@/api/reservation";
import { specialEventApi } from "@/api/specialEvent";
import { Reservation, SpecialEvent } from "@/api/types";
import { ReservationStatus } from "@/components/ReservationStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarDays, Clock, Users, MapPin, ExternalLink, XCircle, Star, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { EventStatusTimeline } from "@/components/booking/EventStatusTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { isApiError } from "@/api/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatDisplayDate, formatDisplayTime } from "@/lib/utils";

export default function ReservationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cancellingEventId, setCancellingEventId] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);


  const { 
    data: reservations = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["user-reservations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const result = await reservationApi.getByUserId(user.id);
      if (isApiError(result)) {
        console.error("Error fetching reservations:", result.error);
        return [];
      }
      return result;
    },
    enabled: !!user,
  });

  const { 
    data: specialEvents = [],
    isLoading: isSpecialEventsLoading,
    refetch: refetchSpecialEvents
  } = useQuery({
    queryKey: ["user-special-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await specialEventApi.getByUserId(user.id);
    },
    enabled: !!user,
  });

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      try {
        await reservationApi.cancel(id);
        toast.success("Reservation cancelled successfully");
        refetch();
      } catch (error) {
        console.error("Error cancelling reservation:", error);
        toast.error("Failed to cancel reservation");
      }
    }
  };

  const handleCancelSpecialEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to cancel this special event request?")) {
      try {
        setCancellingEventId(eventId);
        await specialEventApi.updateStatus(eventId, 'cancelled');
        toast.success('Special event request cancelled');
        refetchSpecialEvents();
      } catch (error) {
        toast.error('Failed to cancel event request');
        console.error(error);
      } finally {
        setCancellingEventId(null);
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
                Please sign in to view your reservations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <PageHeader title="My Reservations" />
        <div className="text-center py-12">
          <p className="text-destructive mb-4 font-medium">Error loading reservations</p>
          <p className="text-muted-foreground mb-6">{(error as Error).message}</p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageHeader 
        title="My Bookings" 
        description="View and manage your restaurant reservations and special events"
      />
      
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Standard Reservations
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Special Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No reservations yet</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-sm">
                  You haven't made any restaurant reservations yet. Explore our top-rated restaurants and book a table today!
                </p>
                <Button asChild>
                  <Link to="/">Browse Restaurants</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            reservations.map((reservation) => (
              <Card key={reservation.id} className="overflow-hidden border-l-4 border-l-primary">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                      <div className="flex gap-4">
                        {reservation.restaurant?.image_url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border">
                            <OptimizedImage 
                              src={reservation.restaurant.image_url} 
                              alt={reservation.restaurant.name} 
                              className="w-full h-full object-cover"
                              aspectRatio="1/1"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold mb-1">{reservation.restaurant?.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                              {formatDisplayDate(reservation.reservation_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ReservationStatus status={reservation.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>
                          {formatDisplayTime(reservation.reservation_time)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span>
                          {reservation.guest_count} {reservation.guest_count === 1 ? "guest" : "guests"}
                        </span>
                      </div>
                      
                      {reservation.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">
                            {reservation.location.city}, {reservation.location.state}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {(reservation.table || reservation.special_requests) && (
                      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed">
                        {reservation.table && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Table Assignment</p>
                            <p className="text-sm font-medium">
                              Table {reservation.table.table_number} 
                              {reservation.table.section && <span className="text-muted-foreground font-normal"> — {reservation.table.section}</span>}
                            </p>
                          </div>
                        )}
                        
                        {reservation.special_requests && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Special Requests</p>
                            <p className="text-sm italic text-muted-foreground line-clamp-2">
                              "{reservation.special_requests}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-xs text-muted-foreground">
                        Booked on {format(new Date(reservation.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 sm:flex-none"
                          onClick={() => navigate(`/reservation/${reservation.id}`)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        
                        {reservation.status === 'pending' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => handleCancel(reservation.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="special" className="space-y-6">
          {isSpecialEventsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : specialEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No special events planned</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-sm">
                  Hosting a private party, corporate event, or celebration? Our partner restaurants offer exclusive spaces and custom menus.
                </p>
                <Button asChild>
                  <Link to="/">Explore Venues</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            specialEvents.map((event) => {
              const isExpanded = expandedEventId === event.id;
              return (
                <Card key={event.id} className="overflow-hidden border-l-4 border-l-amber-500 transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">{event.contact_name || 'Special Event'}</h3>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {event.event_type?.charAt(0).toUpperCase() + event.event_type?.slice(1) || 'Event'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="h-4 w-4" />
                              {event.event_date ? format(new Date(event.event_date), "EEEE, MMM d, yyyy") : 'Date TBD'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {event.event_time || 'Time TBD'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {event.guest_count} guests
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={event.status === 'confirmed' ? 'bg-green-500' : event.status === 'pending' ? 'bg-amber-500' : event.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'}>
                            {(event.status || 'pending').toUpperCase()}
                          </Badge>
                          {event.quote_estimate && (
                            <span className="text-sm font-bold">${event.quote_estimate.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                      >
                        {isExpanded ? 'Hide Details' : 'View Progress & Details'}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Event Progress</h4>
                              <EventStatusTimeline
                                status={event.status}
                                paymentStatus={event.payment_status}
                                createdAt={event.created_at}
                                eventDate={event.event_date}
                              />
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Included Services</h4>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(event.special_services).map(([key, value]) => {
                                    if (!value) return null;
                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return (
                                      <div key={key} className="flex items-center gap-1.5 text-xs font-medium bg-muted border px-2.5 py-1.5 rounded-full">
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                        {label}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {event.event_details && (
                                <div>
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Event Notes</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border italic">"{event.event_details}"</p>
                                </div>
                              )}

                              {event.dietary_requirements && (
                                <div>
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-2">Dietary Requirements</h4>
                                  <p className="text-sm bg-destructive/5 p-3 rounded-lg border border-destructive/20">{event.dietary_requirements}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-xs text-muted-foreground">
                              Requested on {format(new Date(event.created_at), "MMM d, yyyy")}
                            </p>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                Contact Venue
                              </Button>
                              {event.status === 'pending' && (
                                <Button 
                                  variant="ghost" size="sm"
                                  className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleCancelSpecialEvent(event.id)}
                                  disabled={cancellingEventId === event.id}
                                >
                                  {cancellingEventId === event.id ? 'Cancelling...' : 'Cancel Request'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </Container>
  );
}
