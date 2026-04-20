
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarRange, ChefHat, ShieldCheck, Star, UsersRound, Utensils, Wallet } from "lucide-react";
import { SpecialEventForm } from "@/components/events/SpecialEventForm";

export default function Features() {
  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Features</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Discover all the features that make our restaurant booking platform special
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="reservations">
            <CalendarRange className="mr-2 h-4 w-4" />
            Reservations
          </TabsTrigger>
          <TabsTrigger value="private-events">
            <UsersRound className="mr-2 h-4 w-4" />
            Private Events
          </TabsTrigger>
          <TabsTrigger value="chef-experience">
            <ChefHat className="mr-2 h-4 w-4" />
            Chef Experience
          </TabsTrigger>
          <TabsTrigger value="loyalty">
            <Star className="mr-2 h-4 w-4" />
            Loyalty
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Wallet className="mr-2 h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="allergens">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Allergens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-12">
          {/* Reservation Features */}
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <CalendarRange className="mr-2 h-6 w-6" />
              Smart Reservations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>See available tables in real-time without waiting for confirmations. Our system updates instantly as reservations are made.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Table Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Choose your preferred table from an interactive floor plan, ensuring the perfect spot for your dining experience.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Waitlist Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Add yourself to the digital waitlist when your preferred time isn't available, and receive notifications when a table opens up.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Join Waitlist Demo</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Private Events Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <UsersRound className="mr-2 h-6 w-6" />
              Private Events
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Planning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Book private dining areas for special occasions, corporate events, or celebrations. Our platform makes it easy to plan every detail.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Menus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Work with restaurant chefs to create custom menus for your event, tailored to your preferences and dietary requirements.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Event Coordination</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Get assistance with event planning, from decorations to special arrangements, ensuring your event runs smoothly.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardFooter>
                </Card>
              </div>
              <SpecialEventForm restaurantId="800e0ffd-df9d-427a-9321-d3c657f76fce" />
            </div>
          </section>

          {/* More sections... */}
        </TabsContent>

        <TabsContent value="reservations">
          {/* Reservation content... */}
        </TabsContent>

        <TabsContent value="private-events">
          {/* Private events content... */}
        </TabsContent>

        <TabsContent value="chef-experience">
          {/* Chef experience content... */}
        </TabsContent>

        <TabsContent value="loyalty">
          {/* Loyalty content... */}
        </TabsContent>

        <TabsContent value="payments">
          {/* Payments content... */}
        </TabsContent>

        <TabsContent value="allergens">
          {/* Allergens content... */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
