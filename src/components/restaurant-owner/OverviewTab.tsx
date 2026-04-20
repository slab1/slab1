
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, ChevronRight, PlusCircle, Utensils, Settings, BarChart3, Clock, Users, ShieldAlert, History } from "lucide-react";
import { RestaurantValidationSummary } from "@/components/validation/RestaurantValidationSummary";
import { performFullValidation } from "@/lib/validation/restaurantDataQuality";
import { monitoringApi } from "@/api/monitoring";
import { cn } from "@/lib/utils";
import { Restaurant, Reservation } from "@/api/types";
import { StatsOverview } from "./StatsOverview";
import { AnalyticsDashboard } from "./analytics";
import { WaitlistManagement } from "./WaitlistManagement";
import { SubscriptionLimitsCard } from "./SubscriptionLimitsCard";

interface OverviewTabProps {
  restaurants: Restaurant[];
  selectedRestaurantId?: string;
  totalLocations: number;
  totalReservations: number;
  pendingReservations: number;
  reservations?: Reservation[];
  onTabChange: (tab: string) => void;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
}

export function OverviewTab({
  restaurants,
  selectedRestaurantId,
  totalLocations,
  totalReservations,
  pendingReservations,
  reservations = [],
  onTabChange,
  onRestaurantSelect
}: OverviewTabProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  const currentRestaurantId = selectedRestaurantId || (restaurants.length > 0 ? restaurants[0].id : '');
  
  return (
    <div className="space-y-6">
      <StatsOverview
        restaurantCount={restaurants.length}
        locationCount={totalLocations}
        totalReservations={totalReservations}
        pendingReservations={pendingReservations}
      />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Tabs value={timeRange} onValueChange={(val) => setTimeRange(val as 'week' | 'month' | 'year')}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <AnalyticsDashboard 
        reservationsData={reservations || []}
        timeRange={timeRange}
      />
      
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <div className="space-y-4">
          <WaitlistManagement restaurantId={currentRestaurantId} />
          <SubscriptionLimitsCard restaurantCount={restaurants.length} />
        </div>
        
        <div className="space-y-4">
          {restaurants.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <ShieldAlert className="mr-2 h-5 w-5 text-amber-500" />
                    Data Quality Health
                  </CardTitle>
                </div>
                <CardDescription>
                  Overall data completeness and accuracy for {restaurants.find(r => r.id === currentRestaurantId)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const r = restaurants.find(r => r.id === currentRestaurantId);
                  if (!r) return null;
                  const validation = performFullValidation(r, r.locations || []);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Health Score</span>
                        <span className={cn(
                          "text-2xl font-bold",
                          validation.overallScore >= 90 ? "text-green-500" : 
                          validation.overallScore >= 70 ? "text-amber-500" : "text-red-500"
                        )}>
                          {validation.overallScore}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            validation.overallScore >= 90 ? "bg-green-500" : 
                            validation.overallScore >= 70 ? "bg-amber-500" : "bg-red-500"
                          )}
                          style={{ width: `${validation.overallScore}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="p-2 border rounded-md text-center">
                          <div className="text-xs text-muted-foreground uppercase">Errors</div>
                          <div className="text-lg font-semibold text-red-500">
                            {validation.core.issues.filter(i => i.severity === 'error').length + 
                             validation.locations.reduce((acc, l) => acc + l.issues.filter(i => i.severity === 'error').length, 0)}
                          </div>
                        </div>
                        <div className="p-2 border rounded-md text-center">
                          <div className="text-xs text-muted-foreground uppercase">Warnings</div>
                          <div className="text-lg font-semibold text-amber-500">
                            {validation.core.issues.filter(i => i.severity === 'warning').length + 
                             validation.locations.reduce((acc, l) => acc + l.issues.filter(i => i.severity === 'warning').length, 0)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => onTabChange('settings')} // Assuming settings has the editor
                      >
                        Improve Quality
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your Restaurants</CardTitle>
              <CardDescription>
                Manage your restaurant portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {restaurants.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Utensils className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
                  <p>No restaurants yet.</p>
                  <p className="text-sm">Start by adding your first restaurant.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {restaurants.slice(0, 3).map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(restaurant.locations?.length || 0)} location{(restaurant.locations?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (onRestaurantSelect) onRestaurantSelect(restaurant);
                          onTabChange("settings");
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Settings</span>
                      </Button>
                    </div>
                  ))}
                  
                  {restaurants.length > 3 && (
                    <div className="text-center">
                      <Button variant="link" onClick={() => onTabChange("overview")}> {/* This is a bit redundant but okay */}
                        View all {restaurants.length} restaurants
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => onTabChange("settings")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Restaurant
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Reservations</CardTitle>
              <CardDescription>
                Review your latest booking requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!reservations || reservations.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarDays className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
                  <p>No reservations yet.</p>
                  <p className="text-sm">All your new reservations will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reservations.slice(0, 3).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">
                          {reservation.guest_count} {reservation.guest_count === 1 ? 'person' : 'people'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.reservation_date}, {reservation.reservation_time}
                        </p>
                      </div>
                      <div 
                        className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'}`}
                      >
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={() => onTabChange('reservations')} 
                    className="w-full" 
                    variant="secondary"
                  >
                    View All Reservations 
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
