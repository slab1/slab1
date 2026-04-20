import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/hooks/use-auth";
import { Restaurant } from "@/api/types";
import { RestaurantCustomizer } from "@/components/restaurant-owner/RestaurantCustomizer";
import { ReservationsTab } from "@/components/restaurant-owner/ReservationsTab";
import { MenuTab } from "@/components/restaurant-owner/MenuTab";
import { PaymentsTab } from "@/components/restaurant-owner/PaymentsTab";
import { SpecialEventsTab } from "@/components/restaurant-owner/SpecialEventsTab";
import { OverviewTab } from "@/components/restaurant-owner/OverviewTab";
import { WaitlistManagement } from "@/components/restaurant-owner/WaitlistManagement";
import { EnhancedAnalytics } from "@/components/restaurant-owner/EnhancedAnalytics";
import { SubscriptionStatusCard } from "@/components/partnership/SubscriptionStatusCard";
import { RestaurantRegistrationPrompt } from "@/components/restaurant-owner/RestaurantRegistrationPrompt";
import { 
  CalendarDays, 
  Utensils, 
  Settings, 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  Palette,
  Package,
  CreditCard,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePartnerSubscription } from '@/hooks/use-partner-subscription';
import { useNavigate } from 'react-router-dom';
import { useOwnerRestaurants } from "@/hooks/use-owner-restaurants";
import { useRestaurantOverview } from "@/hooks/use-restaurant-overview";

// Import the new smaller components
import { OverviewCards } from "@/components/restaurant-owner/OverviewCards";
import { QuickActions } from "@/components/restaurant-owner/QuickActions";
import { RestaurantSelector } from "@/components/restaurant-owner/RestaurantSelector";
import { NoRestaurantsState } from "@/components/restaurant-owner/NoRestaurantsState";
import { NoSubscriptionState } from "@/components/restaurant-owner/NoSubscriptionState";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import StaffManagement from "@/components/staff/StaffManagement";

export default function RestaurantOwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { subscription: partnerSubscription, loading: subscriptionLoading } = usePartnerSubscription();
  const { data: restaurants = [], isLoading: loadingRestaurants } = useOwnerRestaurants(user?.id);
  const { data: overviewData, isLoading: loadingOverview } = useRestaurantOverview(selectedRestaurant);

  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0]);
    }
  }, [restaurants, selectedRestaurant]);

  const handleAddMenuItems = () => setActiveTab("menu");
  const handleSetAvailability = () => setActiveTab("reservations");
  const handleRestaurantSettings = () => setActiveTab("settings");

  const reservations = overviewData?.reservations || [];
  const overviewStats = overviewData?.stats || {
    reservations: 0,
    pendingReservations: 0,
    menuItems: 0,
    revenue: 0,
    rating: null,
    totalLocations: 0
  };

  const handleUpgradeSubscription = () => {
    navigate('/partnership');
  };

  const handleManageSubscription = () => {
    console.log('Manage subscription');
  };

  const loading = loadingRestaurants || subscriptionLoading || loadingOverview;

  if (!user) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access the restaurant owner dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Container>
    );
  }

  if (loadingRestaurants) {
    return (
      <Container className="py-8">
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </Container>
    );
  }

  if (restaurants.length === 0) {
    return (
      <Container className="py-8">
        <NoRestaurantsState 
          subscription={partnerSubscription}
          onUpgrade={handleUpgradeSubscription}
          onManage={handleManageSubscription}
        />
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
            <p className="text-muted-foreground">Manage your restaurants and reservations</p>
          </div>
          
          <div className="flex items-center gap-4">
            <RestaurantSelector 
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onSelect={setSelectedRestaurant}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2 py-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Reservations</span>
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="flex items-center gap-2 py-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Waitlist</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2 py-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2 py-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 py-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 py-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2 py-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Special Events</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="overview" className="space-y-8">
              <OverviewCards stats={overviewStats} />
              <QuickActions 
                onAddMenuItems={handleAddMenuItems}
                onSetAvailability={handleSetAvailability}
                onRestaurantSettings={handleRestaurantSettings}
              />
              <OverviewTab 
                restaurants={restaurants}
                selectedRestaurantId={selectedRestaurant?.id}
                totalLocations={overviewStats.totalLocations}
                totalReservations={overviewStats.reservations}
                pendingReservations={overviewStats.pendingReservations}
                reservations={reservations}
                onTabChange={setActiveTab}
                onRestaurantSelect={setSelectedRestaurant}
              />
            </TabsContent>

            <TabsContent value="reservations">
              <ReservationsTab restaurantId={selectedRestaurant?.id} />
            </TabsContent>

            <TabsContent value="waitlist">
              <WaitlistManagement restaurantId={selectedRestaurant?.id || ''} />
            </TabsContent>

            <TabsContent value="menu">
              <MenuTab restaurantId={selectedRestaurant?.id} />
            </TabsContent>

            <TabsContent value="staff">
              <StaffManagement restaurantId={selectedRestaurant?.id} />
            </TabsContent>

            <TabsContent value="inventory">
              <InventoryDashboard restaurantId={selectedRestaurant?.id} />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentsTab restaurantId={selectedRestaurant?.id} />
            </TabsContent>

            <TabsContent value="events">
              <SpecialEventsTab restaurantId={selectedRestaurant?.id} />
            </TabsContent>

            <TabsContent value="analytics">
              <EnhancedAnalytics restaurantId={selectedRestaurant?.id} />
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <SubscriptionStatusCard 
                  subscription={partnerSubscription} 
                  onUpgrade={handleUpgradeSubscription}
                  onManage={handleManageSubscription}
                />
                {selectedRestaurant && (
                  <RestaurantCustomizer restaurant={selectedRestaurant} />
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Container>
  );
}
