import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Restaurant } from "@/api/types";
import restaurantApi from "@/api/restaurant";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MultistepBookingForm from "@/components/booking/MultistepBookingForm";
import { SpecialEventBooking } from "@/components/booking/SpecialEventBooking";
import { InteractiveRestaurantMap } from "@/components/restaurants/InteractiveRestaurantMap";
import { ComprehensiveGallery } from "@/components/restaurants/ComprehensiveGallery";
import { DigitalMenu } from "@/components/restaurants/DigitalMenu";
import { CalendarDays, Users, CalendarClock, Search, ArrowLeft, Utensils, Clock, MapPin, Info, ChevronDown, ChevronUp, ImageIcon, Map, Menu } from "lucide-react";
import { RestaurantSearch } from "@/components/RestaurantSearch";
import { PersonalizedRecommendations } from "@/components/recommendations/PersonalizedRecommendations";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { OptimizedImage } from "@/components/ui/optimized-image";

export default function Booking() {
  const { restaurantId: paramId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(!!paramId);
  const [activeTab, setActiveTab] = useState<string>("regular");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        if (paramId) {
          setLoading(true);
          
          // Try to fetch by ID first if it looks like a UUID
          let data = null;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          if (uuidRegex.test(paramId)) {
            data = await restaurantApi.getById(paramId);
          }
          
          // If not found by ID or not a UUID, try by slug
          if (!data) {
            data = await restaurantApi.getBySlug(paramId);
          }
          
          setRestaurant(data);
          if (data?.locations && data.locations.length > 0) {
            setSelectedLocationId(data.locations[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [paramId]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>

        {/* Mobile Floating Book Now Button */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button 
            className="rounded-full shadow-2xl h-14 px-8 font-bold text-lg"
            onClick={() => {
              setActiveTab("regular");
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Book Now
          </Button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
              <Utensils className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Restaurant Not Found</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We couldn't find the restaurant you're looking for. It might have been moved, renamed, or is currently unavailable.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link to="/restaurants">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Restaurants
                </Link>
              </Button>
              <Button asChild>
                <Link to="/">
                  Home Page
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find another restaurant
              </CardTitle>
              <CardDescription>
                Search for your favorite cuisine or location to find a new dining experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantSearch />
            </CardContent>
          </Card>

          <div className="pt-4">
            <PersonalizedRecommendations />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Cuisines</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {["Italian", "Japanese", "Mexican", "French", "Indian"].map((cuisine) => (
                  <Button key={cuisine} variant="secondary" size="sm" asChild>
                    <Link to={`/restaurants?cuisine=${cuisine.toLowerCase()}`}>
                      {cuisine}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If you think this is a mistake, please contact our support team or check our help center.
                </p>
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link to="/help">Visit Help Center</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const locationId = selectedLocationId || (restaurant.locations?.[0]?.id) || restaurant.id;
  const selectedLocation = restaurant.locations?.find(loc => loc.id === locationId) || restaurant.locations?.[0];
  const restaurantId = restaurant.id;
  const restaurantName = restaurant.name;

  // Standardized address formatting
  const formatAddress = (loc: any) => {
    if (!loc) return "Location Available";
    const address = loc.address as any;
    if (typeof address === 'object') {
      const parts = [
        address?.street || address?.address || loc.address,
        address?.city || loc.city,
        address?.state || loc.state,
        address?.zip_code || loc.zip_code
      ].filter(Boolean);
      return parts.join(', ') || "Location Available";
    }
    const parts = [loc.address, loc.city, loc.state, loc.zip_code].filter(Boolean);
    return parts.join(', ') || "Location Available";
  };

  const getShortAddress = (loc: any) => {
    if (!loc) return "Location Available";
    const address = loc.address as any;
    const city = typeof address === 'object' ? address?.city : loc.city;
    const state = typeof address === 'object' ? address?.state : loc.state;
    return city ? `${city}${state ? `, ${state}` : ''}` : "Location Available";
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab("details");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">{restaurant.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                    {restaurant.cuisine}
                  </Badge>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Utensils className="h-4 w-4" />
                    {restaurant.price}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-4 w-4" />
                    {getShortAddress(restaurant.locations?.[0])}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={() => scrollToSection('gallery')}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Gallery
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => scrollToSection('menu')}>
                    <Menu className="h-4 w-4 mr-2" />
                    Menu
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => scrollToSection('location')}>
                    <Map className="h-4 w-4 mr-2" />
                    Location
                  </Button>
                </div>
              </div>

              <Collapsible
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                className="w-full space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground line-clamp-2 max-w-2xl">
                    {restaurant.description || "No description available for this restaurant."}
                  </p>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      {isDetailsOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle details</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-4 pt-4 border-t mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Opening Hours
                      </h4>
                      <div className="text-sm space-y-1.5">
                        {restaurant.opening_hours ? (
                          Object.entries(typeof restaurant.opening_hours === 'string' ? JSON.parse(restaurant.opening_hours) : restaurant.opening_hours).map(([day, hours]: [string, any]) => (
                            <div key={day} className="flex justify-between items-center py-0.5 border-b border-muted last:border-0">
                              <span className="capitalize font-medium w-24">{day}</span>
                              <span className={hours.closed ? "text-destructive" : "text-muted-foreground"}>
                                {hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground italic">Contact restaurant for hours</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Restaurant Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.features ? (
                          (typeof restaurant.features === 'string' ? restaurant.features.split(',') : restaurant.features).map((feature: string) => (
                            <Badge key={feature} variant="outline" className="bg-primary/5 border-primary/20 text-primary-foreground/80">
                              {feature.trim()}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground italic text-sm">No specific features listed</p>
                        )}
                      </div>
                      
                      {restaurant.locations?.[0] && (restaurant.locations[0].contact_info || restaurant.locations[0].phone_number || restaurant.locations[0].email) && (
                        <div className="pt-4 mt-4 border-t">
                          <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Contact Information</h4>
                          <div className="text-sm space-y-1">
                            {restaurant.locations[0].phone_number && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Phone:</span>
                                <a href={`tel:${restaurant.locations[0].phone_number}`} className="hover:text-primary transition-colors">
                                  {restaurant.locations[0].phone_number}
                                </a>
                              </div>
                            )}
                            {restaurant.locations[0].email && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Email:</span>
                                <a href={`mailto:${restaurant.locations[0].email}`} className="hover:text-primary transition-colors">
                                  {restaurant.locations[0].email}
                                </a>
                              </div>
                            )}
                            {!restaurant.locations[0].phone_number && !restaurant.locations[0].email && typeof restaurant.locations[0].contact_info === 'object' && (
                              <>
                                {(restaurant.locations[0].contact_info as any).phone && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <a href={`tel:${(restaurant.locations[0].contact_info as any).phone}`} className="hover:text-primary transition-colors">
                                      {(restaurant.locations[0].contact_info as any).phone}
                                    </a>
                                  </div>
                                )}
                                {(restaurant.locations[0].contact_info as any).email && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Email:</span>
                                    <a href={`mailto:${(restaurant.locations[0].contact_info as any).email}`} className="hover:text-primary transition-colors">
                                      {(restaurant.locations[0].contact_info as any).email}
                                    </a>
                                  </div>
                                )}
                              </>
                            )}
                            {!restaurant.locations[0].phone_number && !restaurant.locations[0].email && typeof restaurant.locations[0].contact_info === 'string' && (
                              <p>{restaurant.locations[0].contact_info}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {restaurant.image_url && (
              <div className="w-full md:w-64 h-40 rounded-lg overflow-hidden border shadow-sm flex-shrink-0">
                <OptimizedImage
                  src={restaurant.image_url} 
                  alt={restaurant.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {restaurant.locations && restaurant.locations.length > 1 && (
          <div className="mb-6 bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-sm">Select Location</h3>
                <p className="text-xs text-muted-foreground">This restaurant has multiple locations</p>
              </div>
            </div>
            <select 
              value={selectedLocationId} 
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-background border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              {restaurant.locations.map((loc: any) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name || loc.city || loc.address}
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="regular" className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              Regular Reservation
            </TabsTrigger>
            <TabsTrigger value="special" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Special Event
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center">
              <CalendarClock className="h-4 w-4 mr-2" />
              Recurring Booking
              <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1 uppercase">Soon</Badge>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Restaurant Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="regular">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-10">
                {/* Gallery Preview */}
                <section id="gallery">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">Gallery</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("details")}>
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 h-[300px]">
                    <div className="rounded-lg overflow-hidden bg-muted col-span-1">
                      <OptimizedImage
                        src={restaurant.image_url || "/placeholder.svg"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="grid grid-rows-2 gap-4 col-span-1">
                      {restaurant.gallery && restaurant.gallery.length > 0 ? (
                        restaurant.gallery.slice(0, 2).map((img: any, i: number) => (
                          <div key={i} className="rounded-lg overflow-hidden bg-muted">
                            <OptimizedImage
                              src={typeof img === 'string' ? img : img.url}
                              alt={typeof img === 'string' ? `${restaurant.name} ${i + 1}` : (img.caption || `${restaurant.name} ${i + 1}`)}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                          <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </section>
                
                {/* About Section */}
                <section>
                  <h2 className="text-2xl font-bold mb-4">About {restaurant.name}</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {restaurant.description || "Experience the finest dining experience at our restaurant."}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border border-dashed">
                    <div className="flex items-start gap-3">
                      <Utensils className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Cuisine</h3>
                        <p className="text-sm text-muted-foreground">{restaurant.cuisine || "Various"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="h-5 w-5 flex items-center justify-center font-bold text-primary text-lg mt-0.5">$</span>
                      <div>
                        <h3 className="font-semibold mb-1">Price Range</h3>
                        <p className="text-sm text-muted-foreground">{restaurant.price || "$$$"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Features</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {restaurant.features ? (
                            (typeof restaurant.features === 'string' ? restaurant.features.split(',') : restaurant.features).slice(0, 3).map((feature: string) => (
                              <Badge key={feature} variant="secondary" className="text-[10px] py-0">
                                {feature.trim()}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Standard Dining</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Address</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatAddress(restaurant.locations?.[0])}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Menu Highlights */}
                <section id="menu">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Menu className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">Menu Highlights</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("details")}>
                      Full Menu
                    </Button>
                  </div>
                  {restaurant.menuCategories && restaurant.menuCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(restaurant.menuCategories[0].menu_items || restaurant.menuCategories[0].items || [])
                        .slice(0, 4).map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-0">
                          <div className="min-w-0 pr-4">
                            <h4 className="font-medium truncate">{item.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                          <span className="font-semibold text-primary">{item.price ? `$${item.price}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-muted/30 border-dashed">
                      <CardContent className="py-6 text-center text-muted-foreground text-sm">
                        Menu details are being updated. Check back soon!
                      </CardContent>
                    </Card>
                  )}
                </section>

                {/* Location Map */}
                <section id="location">
                  <div className="flex items-center gap-2 mb-6">
                    <Map className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Location & Directions</h2>
                  </div>
                  <div className="rounded-xl overflow-hidden border shadow-sm">
                    {selectedLocation ? (
                      <InteractiveRestaurantMap location={selectedLocation} height="350px" />
                    ) : (
                      <div className="h-[350px] bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">Map not available for this location</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
              
              <div className="relative">
                <div className="sticky top-6">
                  <MultistepBookingForm
                    locationId={locationId}
                    restaurantId={restaurantId}
                    restaurantName={restaurantName}
                    restaurant={restaurant}
                  />
                  
                  <Card className="mt-6 bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Info className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-semibold text-sm">Booking Information</h4>
                      </div>
                      <ul className="text-xs space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary mt-1.5" />
                          Reservations are held for 15 minutes past the booking time.
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary mt-1.5" />
                          For groups larger than {restaurant.settings?.max_party_size || 8}, please book a special event.
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary mt-1.5" />
                          Cancellation policy: {typeof restaurant.settings?.cancellation_policy === 'string' ? restaurant.settings.cancellation_policy : "24 hours notice required."}
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="special">
            <SpecialEventBooking 
              restaurantId={restaurant.id} 
              restaurant={restaurant} 
            />
          </TabsContent>
          
          <TabsContent value="recurring">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 space-y-3">
                  <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">Recurring Reservations</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    For recurring reservations, please contact our restaurant directly or 
                    book a special event and mention your recurring needs.
                  </p>
                  <div className="pt-4 flex justify-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = `tel:${restaurant.locations?.[0]?.phone_number || '555-123-4567'}`}
                    >
                      Call Restaurant
                    </Button>
                    <Button onClick={() => setActiveTab("special")}>
                      Book Special Event
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-10">
              {/* Gallery Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <ImageIcon className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Restaurant Gallery</h2>
                </div>
                <ComprehensiveGallery images={restaurant.gallery || []} />
              </section>

              {/* Menu Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Menu className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Digital Menu</h2>
                </div>
                {restaurant.menuCategories && restaurant.menuCategories.length > 0 ? (
                  <DigitalMenu 
                    categories={restaurant.menuCategories} 
                    restaurantName={restaurant.name} 
                  />
                ) : (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <Utensils className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Menu is not available online yet. Please contact the restaurant for more information.</p>
                    </CardContent>
                  </Card>
                )}
              </section>

              {/* Location & Map Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Map className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Location & Directions</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    {selectedLocation ? (
                      <InteractiveRestaurantMap location={selectedLocation} height="450px" />
                    ) : (
                      <Card className="h-[450px] flex items-center justify-center">
                        <p className="text-muted-foreground">Map not available for this location</p>
                      </Card>
                    )}
                  </div>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Address</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <p className="text-sm leading-relaxed">
                            {formatAddress(selectedLocation)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Prioritize direct fields over contact_info JSONB */}
                        {(selectedLocation?.phone_number || (selectedLocation?.contact_info as any)?.phone || (selectedLocation?.contact_info as any)?.phone_number) && (
                          <div className="flex items-center gap-3 text-sm">
                            <Badge variant="outline" className="w-16 justify-center">Phone</Badge>
                            <span>
                              {selectedLocation?.phone_number || 
                               (selectedLocation?.contact_info as any)?.phone_number || 
                               (selectedLocation?.contact_info as any)?.phone}
                            </span>
                          </div>
                        )}
                        
                        {(selectedLocation?.email || (selectedLocation?.contact_info as any)?.email) && (
                          <div className="flex items-center gap-3 text-sm">
                            <Badge variant="outline" className="w-16 justify-center">Email</Badge>
                            <span>
                              {selectedLocation?.email || (selectedLocation?.contact_info as any)?.email}
                            </span>
                          </div>
                        )}

                        {!selectedLocation?.phone_number && 
                         !selectedLocation?.email && 
                         !selectedLocation?.contact_info && (
                          <p className="text-sm text-muted-foreground">No contact information provided</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
