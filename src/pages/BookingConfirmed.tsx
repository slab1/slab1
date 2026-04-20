import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { CalendarCheck, Clock, Users, MapPin, Info, Bell, AlertCircle, Calendar, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingConfirmed() {
  // Simulate push notification permission request on page load
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        // Check if the browser supports notifications
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            toast.success('Notifications enabled! We will remind you about your reservation.');
          }
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    // Wait a few seconds before requesting permission
    const timer = setTimeout(() => {
      requestNotificationPermission();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto py-12 px-4 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 mb-4">
                <CalendarCheck className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">Reservation Request Received!</h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Your reservation is pending confirmation from the restaurant. We'll notify you once it's confirmed.
            </p>
          </div>
          
          <Card className="mb-8 border-l-4 border-l-amber-400 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Info className="mr-2 h-5 w-5 text-amber-500" /> 
                Reservation Status
              </CardTitle>
              <CardDescription className="text-base">
                A restaurant staff member will review and confirm your reservation shortly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Bell className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      <span className="font-medium">Pending Confirmation</span>
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      You will receive an email notification when your reservation is confirmed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">What's Next?</span>
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      The restaurant will review your request and confirm your reservation. 
                      Once confirmed, we'll send you a detailed confirmation email with your booking details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Add to Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Don't forget your reservation! Add it to your calendar for a reminder.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2 fill-current">
                      <path d="M19.5 3h-15A1.5 1.5 0 0 0 3 4.5v15A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 19.5 3zm-12 12.75a.75.75 0 0 1-1.5 0V15H4.5a.75.75 0 0 1 0-1.5H6v-.75a.75.75 0 0 1 1.5 0v.75h.75a.75.75 0 0 1 0 1.5h-.75v.75zM8.25 9a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75zm8.25 1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h4.5zm0 3a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h4.5zm0-6a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h4.5zm-8.25-3a.75.75 0 0 1 .75.75v.75h.75a.75.75 0 0 1 0 1.5H9v.75a.75.75 0 0 1-1.5 0V7.5h-.75a.75.75 0 0 1 0-1.5h.75v-.75a.75.75 0 0 1 .75-.75z" />
                    </svg>
                    Google Calendar
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2 fill-current">
                      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm0 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 1a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
                    </svg>
                    Apple Calendar
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2 fill-current">
                      <path d="M20.13 5.48H3.87A1.55 1.55 0 0 0 2.32 7v11.36a1.55 1.55 0 0 0 1.55 1.55h16.26a1.55 1.55 0 0 0 1.55-1.55V7a1.55 1.55 0 0 0-1.55-1.52z" />
                      <path d="M16.94 4.1h1.03v1.97h-1.03V4.1zM6.03 4.1h1.03v1.97H6.03V4.1zM9.32 10.13h1.35v1.35H9.32v-1.35zm0 3.23h1.35v1.35H9.32v-1.35zm0 3.23h1.35v1.35H9.32v-1.35z" fill="#fefefe" />
                      <path d="M3.87 4.75h2.81V2.58a.3.3 0 0 1 .29-.29h.54a.3.3 0 0 1 .3.3v2.16h8.39V2.58a.3.3 0 0 1 .29-.29h.54a.3.3 0 0 1 .3.3v2.16h2.8a.67.67 0 0 1 .68.68v1.94H3.2V5.42a.67.67 0 0 1 .67-.67z" fill="#fefefe" />
                    </svg>
                    Outlook
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-primary" />
                  Enable Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We'll send you timely reminders about your upcoming reservation.
                </p>
                <div className="space-y-2">
                  <Button className="w-full">Enable Browser Notifications</Button>
                  <p className="text-xs text-muted-foreground">
                    You'll get a notification on the day of your reservation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Reservation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-muted-foreground text-sm">
                    Your confirmation email will include these details
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Party Size</p>
                  <p className="text-muted-foreground text-sm">
                    Your confirmation email will include these details
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground text-sm">
                    Your confirmation email will include these details
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex flex-col space-y-3">
              <Button asChild className="w-full">
                <Link to="/reservations">View Your Reservations</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/">Return to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
