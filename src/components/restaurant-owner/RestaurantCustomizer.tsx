import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestaurantProfileEditor } from "./RestaurantProfileEditor";
import { WaitlistSettingsForm } from "./WaitlistSettingsForm";
import { AppearanceSettingsForm } from "./AppearanceSettingsForm";
import { BookingSettingsForm } from "./BookingSettingsForm";
import { Restaurant } from "@/api/types";
import { Utensils, LayoutGrid, Clock, Calendar } from "lucide-react";

interface RestaurantCustomizerProps {
  restaurant: Restaurant;
}

export function RestaurantCustomizer({ restaurant }: RestaurantCustomizerProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Customization</CardTitle>
          <CardDescription>
            Personalize your restaurant profile, waitlist settings, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center gap-1.5">
                  <Utensils className="h-4 w-4" />
                  Restaurant Profile
                </TabsTrigger>
                <TabsTrigger value="booking" className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Booking Settings
                </TabsTrigger>
                <TabsTrigger value="waitlist" className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Waitlist Settings
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  Appearance
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="profile" className="mt-0">
                <RestaurantProfileEditor restaurant={restaurant} />
              </TabsContent>

              <TabsContent value="booking" className="mt-0">
                <BookingSettingsForm restaurantId={restaurant.id} />
              </TabsContent>
              
              <TabsContent value="waitlist" className="mt-0">
                <WaitlistSettingsForm restaurantId={restaurant.id} />
              </TabsContent>
              
              <TabsContent value="appearance" className="mt-0">
                <AppearanceSettingsForm restaurantId={restaurant.id} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
