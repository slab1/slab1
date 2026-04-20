import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Calendar, LogOut, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { LoyaltyProgramSummary } from '@/components/profile/LoyaltyProgramSummary';   
import { Reservation } from '@/api/types';
import { reservationApi } from '@/api/reservation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageUpload } from '@/components/ui/image-upload';
import { OptimizedImage } from '@/components/ui/optimized-image';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import NotificationList from '@/components/notifications/NotificationList';

const profileSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters long' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone_number: z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, { message: 'Please enter a valid 10-digit phone number' }).optional().or(z.literal('')),
  address: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

type ProfileValues = z.infer<typeof profileSchema>;

// Loading skeleton for profile page
const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="lg:col-span-2">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, session, logout, updateUserProfile, isLoading: authLoading, isUserDataLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const defaultTab = searchParams.get('tab') || 'profile';

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone_number: '',
      address: '',
      avatar_url: '',
    },
  });

  const { data: reservationsData = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['user-reservations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await reservationApi.getByUserId(user.id);
      // Handle potential API error response
      if (result && 'error' in result) return [];
      return result;
    },
    enabled: !!user?.id,
  });

  // Ensure reservations is always an array
  const reservations = Array.isArray(reservationsData) ? reservationsData : [];

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reservations', user?.id] });
      toast.success('Reservation cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel reservation');
    },
  });
  
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading || isUserDataLoading) {
      return;
    }
    
    // If no session at all, redirect to login
    if (!session) {
      navigate('/login');
      return;
    }
    
    // If we have user data, set up the form (only if not dirty to avoid overwriting user input)
    if (user && !form.formState.isDirty) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user, session, authLoading, isUserDataLoading, navigate, form]);

  const onSubmit = async (data: ProfileValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateUserProfile(data);
      form.reset(data); // Mark form as not dirty after successful save
      toast.success('Profile updated successfully!');
    } catch (err) {
      const error = err as Error;
      console.error('Profile update error:', error);
      setError(error.message || 'An error occurred while updating your profile.');
    } finally {
      setIsLoading(false);      
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const handleCancelReservation = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      cancelMutation.mutate(id);
    }
  };

  // Show loading while auth is still loading
  if (authLoading || isUserDataLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <ProfileSkeleton />
      </div>
    );
  }

  // If no session after loading, show authentication required
  if (!session) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no user data but we have a session, show loading instead of error initially
  // Only show error if we've waited and user data still hasn't loaded
  if (!user && session) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <ProfileSkeleton />
      </div>
    );
  }

  // If no user data at all after loading finishes
  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Loading Error</CardTitle>
            <CardDescription>
              There was an issue loading your profile data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-2">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <ErrorBoundary>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Account Summary</CardTitle>
                <CardDescription>Your account status and membership</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {user.avatar_url ? (
                        <OptimizedImage 
                          src={user.avatar_url} 
                          alt="Profile avatar" 
                          className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                          aspectRatio="1/1"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-background" title="Active Account" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{user.name || user.email}</p>
                      <Badge variant={user.is_owner ? "default" : "secondary"} className="capitalize">
                        {user.role?.replace('_', ' ') || 'User'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    
                    {user.phone_number && (
                      <div className="flex items-center text-sm">
                        <User className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span>{user.phone_number}</span>
                      </div>
                    )}
                    
                    {user.createdAt && (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Account Security</p>
                      <p className="text-xs text-muted-foreground">Verified Email Account</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ErrorBoundary>
              <LoyaltyProgramSummary />
            </ErrorBoundary>
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile Information</TabsTrigger>
                <TabsTrigger value="reservations">My Reservations</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <ErrorBoundary>
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details here
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input
                                        placeholder="First name"
                                        className="pl-10"
                                        disabled={isLoading}
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input
                                        placeholder="Last name"
                                        className="pl-10"
                                        disabled={isLoading}
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      type="email"
                                      placeholder="you@example.com"
                                      className="pl-10"
                                      readOnly={true}
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your phone number"
                                    disabled={isLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your address"
                                    disabled={isLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="avatar_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Picture</FormLabel>
                                <FormControl>
                                  <ImageUpload
                                    storageBucket="avatars"
                                    storagePath={user.id}
                                    initialImageUrl={field.value}
                                    onImageUrlChange={(url) => field.onChange(url || '')}
                                    className="w-32 h-32 mx-auto md:mx-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating profile...
                              </>
                            ) : "Update profile"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ErrorBoundary>
              
              <ErrorBoundary>
                <TabsContent value="reservations">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Reservations</CardTitle>
                      <CardDescription>
                        View and manage your restaurant reservations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reservationsLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : reservations.length > 0 ? (
                        <div className="space-y-4">
                          {reservations.map((reservation: Reservation) => (
                            <Card key={reservation.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium">
                                      {reservation.restaurant?.name || reservation.location?.restaurant?.name || "Unknown Restaurant"}
                                    </h3>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {new Date(reservation.reservation_date).toLocaleDateString()} at {reservation.reservation_time}
                                    </div>
                                    <p className="text-sm mt-1">
                                      {reservation.guest_count} {reservation.guest_count === 1 ? 'person' : 'people'}
                                    </p>
                                    <div className="mt-2">
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        reservation.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {reservation.status}
                                      </span>
                                    </div>
                                  </div>
                                  {reservation.status !== 'cancelled' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleCancelReservation(reservation.id)}
                                      disabled={cancelMutation.isPending}
                                    >
                                      {cancelMutation.isPending && cancelMutation.variables === reservation.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : 'Cancel'}
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No reservations yet</h3>
                          <p className="text-muted-foreground mb-4">
                            You haven't made any restaurant reservations yet.
                          </p>
                          <Button onClick={() => navigate('/')}>
                            Find a restaurant
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </ErrorBoundary>

              <ErrorBoundary>
                <TabsContent value="notifications" className="space-y-8">
                  <NotificationList />
                  <NotificationPreferences />
                </TabsContent>
              </ErrorBoundary>
            </Tabs>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
