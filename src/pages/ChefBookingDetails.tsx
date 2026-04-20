import { useEffect, useState } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { chefBookingApi } from '@/api/chefBooking';
import { ChefBooking } from '@/api/types';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, Calendar, ChefHat, Clock, DollarSign, MapPin, User, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { isApiError } from '@/api/utils';
import { errorTracker } from '@/utils/error-tracking';

export default function ChefBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: bookingResponse, isLoading, refetch } = useQuery({
    queryKey: ['chef-booking', id],
    queryFn: () => chefBookingApi.getById(id || ''),
    enabled: !!id,
  });

  const [isCancelling, setIsCancelling] = useState(false);

  // Check if the response is an error
  if (bookingResponse && isApiError(bookingResponse)) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {bookingResponse.error || 'Failed to load booking details'}
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Link to="/chef-bookings">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const booking = bookingResponse as ChefBooking;

  const handleCancelBooking = async () => {
    if (!booking?.id) return;
    
    try {
      setIsCancelling(true);
      const result = await chefBookingApi.updateStatus(booking.id, 'cancelled');
      if (isApiError(result)) {
        toast.error(result.error || 'Failed to cancel booking');
        return;
      }
      toast.success('Booking cancelled successfully');
      refetch(); // Refresh the booking data
    } catch (error) {
      errorTracker.captureError(error as Error, 'error', {
        context: 'chef_booking_cancel',
        bookingId: booking.id,
        userId: user?.id
      });
      toast.error('Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'confirmed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'completed': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const isBookingUpcoming = booking && new Date(booking.booking_date) > new Date();
  const canCancel = booking && 
    ['pending', 'confirmed'].includes(booking.status) && 
    isBookingUpcoming;

  if (isLoading) {
    return (
      <div className="container py-10 px-4 max-w-4xl">
        <div className="animate-pulse space-y-8">
          <div className="flex justify-between">
            <div className="h-8 w-1/3 bg-muted rounded"></div>
            <div className="h-8 w-1/4 bg-muted rounded"></div>
          </div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-10 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Booking details not found. Please return to your bookings.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Link to="/chef-bookings">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/chef-bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={`${getStatusBadgeColor(booking.status)} capitalize text-sm`}
          >
            Status: {booking.status}
          </Badge>
          <Badge 
            variant="outline" 
            className={`${getPaymentStatusBadgeColor(booking.payment_status)} capitalize text-sm`}
          >
            Payment: {booking.payment_status}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chef Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {booking.image ? (
                  <OptimizedImage
                    src={booking.image} 
                    alt={booking.chef_name} 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ChefHat className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">Chef {booking.chef_name}</h3>
                  <p className="text-muted-foreground">{booking.specialty}</p>
                  <p className="text-sm mt-1">${booking.hourly_rate}/hour</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{format(parseISO(booking.booking_date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time & Duration</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{booking.booking_time} ({booking.duration} hours)</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{booking.guest_count} people</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Requested by</p>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user?.name || user?.email || 'User'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 pt-2">
                <p className="text-sm text-muted-foreground">Location</p>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground shrink-0" />
                  <span>{booking.location}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Menu Description</p>
                  <p className="mt-1 text-muted-foreground">{booking.menu_description}</p>
                </div>
                
                {booking.special_requests && (
                  <div>
                    <p className="font-medium">Special Requests</p>
                    <p className="mt-1 text-muted-foreground">{booking.special_requests}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chef Services</span>
                <span>${booking.total_amount}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Amount</span>
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-0.5" />
                  {booking.total_amount}
                </span>
              </div>
            </CardContent>
            {booking.payment_status === 'pending' && (
              <CardFooter>
                <Button className="w-full" disabled>
                  Pay Now
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {canCancel && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
                <CardDescription>
                  Manage your booking
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {!isBookingUpcoming && booking.status !== 'cancelled' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Booking is in the past</AlertTitle>
              <AlertDescription>
                This booking has already occurred and cannot be modified.
              </AlertDescription>
            </Alert>
          )}
          
          {booking.status === 'cancelled' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Booking Cancelled</AlertTitle>
              <AlertDescription>
                This booking has been cancelled and cannot be restored.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
