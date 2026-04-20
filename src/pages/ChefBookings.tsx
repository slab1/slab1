
import { useEffect, useState } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Link } from 'react-router-dom';
import { chefBookingApi } from '@/api/chefBooking';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefBooking } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, ChefHat, Clock, MapPin, Users } from 'lucide-react';
import { isApiError } from '@/api/utils';
import { errorTracker } from '@/utils/error-tracking';

export default function ChefBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ChefBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const data = await chefBookingApi.getByUserId(user.id);
        
        if (isApiError(data)) {
          toast.error(data.error || 'Failed to load your bookings');
          setBookings([]);
          return;
        }
        
        setBookings(data);
      } catch (error) {
        errorTracker.captureError(error as Error, 'error', {
          context: 'chef_bookings_fetch',
          userId: user.id
        });
        toast.error('Failed to load your bookings');
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [user?.id]);
  
  const filteredBookings = bookings.filter(booking => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time || '00:00:00'}`);
    const now = new Date();

    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return ['pending', 'confirmed'].includes(booking.status) && bookingDateTime >= now;
    }
    if (activeTab === 'past') {
      return booking.status === 'completed' || (booking.status !== 'cancelled' && bookingDateTime < now);
    }
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  }).sort((a, b) => {
    const dateA = new Date(`${a.booking_date}T${a.booking_time || '00:00:00'}`);
    const dateB = new Date(`${b.booking_date}T${b.booking_time || '00:00:00'}`);
    return activeTab === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'confirmed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'completed': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Chef Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage your private chef bookings</p>
        </div>
        <Link to="/chefs-warehouse">
          <Button>
            <ChefHat className="mr-2 h-4 w-4" />
            Find a Chef
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                      <div className="flex justify-between mt-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-10 w-28" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === 'all' ? "You don't have any chef bookings yet." : `You don't have any ${activeTab} bookings.`}
              </p>
              <Link to="/chefs-warehouse">
                <Button>
                  <ChefHat className="mr-2 h-4 w-4" />
                  Find a Chef
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const bookingDate = parseISO(booking.booking_date);
                return (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {booking.image ? (
                              <OptimizedImage
                                src={booking.image} 
                                alt={booking.chef_name} 
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <ChefHat className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium">Chef {booking.chef_name}</h3>
                              <p className="text-sm text-muted-foreground">{booking.specialty}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusBadgeColor(booking.status)} capitalize`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{format(bookingDate, 'EEEE, MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{booking.booking_time} ({booking.duration} hours)</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{booking.guest_count} guests</span>
                          </div>
                          <div className="flex items-center md:col-span-2">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                            <span className="truncate">{booking.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-2 border-t border-border">
                          <div className="font-medium">
                            Total: ${booking.total_amount}
                          </div>
                          <Link to={`/chef-booking/${booking.id}`}>
                            <Button variant="outline">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
