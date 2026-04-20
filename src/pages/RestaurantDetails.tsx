import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingForm } from "@/components/BookingForm";
import { Restaurant, MenuItem, RestaurantLocation } from "@/api/types";
import restaurantApi from "@/api/restaurant";
import { MapPin, Phone, Mail, Clock, Star, DollarSign, Utensils, Image, CalendarRange, Users, Search, ArrowLeft, Instagram, Facebook, Twitter, Globe, Quote, ChefHat, History as HistoryIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { InteractiveRestaurantMap } from "@/components/restaurants/InteractiveRestaurantMap";
import { ComprehensiveGallery } from "@/components/restaurants/ComprehensiveGallery";
import { DigitalMenu } from "@/components/restaurants/DigitalMenu";
import { PersonalizedRecommendations } from "@/components/recommendations/PersonalizedRecommendations";
import { RestaurantSearch } from "@/components/RestaurantSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function RestaurantDetails() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<RestaurantLocation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchRestaurantDetails() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Try to fetch by ID first if it looks like a UUID
        let restaurantData = null;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (uuidRegex.test(id)) {
          restaurantData = await restaurantApi.getById(id);
        }
        
        // If not found by ID or not a UUID, try by slug
        if (!restaurantData) {
          restaurantData = await restaurantApi.getBySlug(id);
        }

        if (restaurantData) {
          setRestaurant(restaurantData);
          
          if (restaurantData.locations) {
            setLocations(restaurantData.locations);
          }
          
          const allMenuItems: MenuItem[] = [];
          if (restaurantData.menuCategories) {
            restaurantData.menuCategories.forEach(category => {
              const items = category.menu_items || category.items;
              if (items) {
                allMenuItems.push(...items);
              }
            });
          }
          setMenuItems(allMenuItems);
        }
        
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurantDetails();
  }, [id]);

  if (loading) {
    return (
      <main className="container mx-auto py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="container mx-auto py-20 px-4">
        <Helmet>
          <title>Restaurant Not Found | Reservatoo</title>
        </Helmet>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
              <Utensils className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Restaurant Not Found</h1>
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
                Discover other options
              </CardTitle>
              <CardDescription>
                Search for your favorite cuisine or location to find a new dining experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantSearch />
            </CardContent>
          </Card>

          <div className="pt-8">
            <PersonalizedRecommendations />
          </div>
        </div>
      </main>
    );
  }

  const { name, description, image_url, cuisine, price, rating, features, chef_name, chef_bio, history, social_links, testimonials } = restaurant;

  const formatFeatures = (features: string | undefined) => {
    if (!features) return [];
    try {
      if (typeof features === 'string') {
        if (features.startsWith('[') || features.startsWith('{')) {
          return JSON.parse(features);
        }
        return features.split(',').map(f => f.trim());
      }
      return features;
    } catch (e) {
      return [features];
    }
  };

  const displayFeatures = formatFeatures(features as string);
  const hasFeatures = Array.isArray(displayFeatures) ? displayFeatures.length > 0 : !!displayFeatures;

  return (
    <main className="container mx-auto py-6 px-4">
      <Helmet>
        <title>{`${name} | ${cuisine || 'Restaurant'} | Reservatoo`}</title>
        <meta name="description" content={description || `Book a table at ${name}. ${cuisine ? cuisine + ' cuisine.' : ''} Reserve online with Reservatoo.`} />
        <meta property="og:title" content={`${name} — Book a Table | Reservatoo`} />
        <meta property="og:description" content={description || `Discover ${name} and reserve your table online.`} />
        <meta property="og:type" content="restaurant.restaurant" />
        {image_url && <meta property="og:image" content={image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${name} | Reservatoo`} />
        <meta name="twitter:description" content={description || `Book a table at ${name}.`} />
        {image_url && <meta name="twitter:image" content={image_url} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name,
            description,
            image: image_url,
            servesCuisine: cuisine,
            ...(rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating, bestRating: 5 } } : {}),
            ...(price ? { priceRange: price } : {}),
            ...(locations?.[0] ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: locations[0].address,
                addressLocality: locations[0].city,
                addressRegion: locations[0].state,
              },
              telephone: locations[0].phone_number,
            } : {}),
          })}
        </script>
      </Helmet>
      {/* Hero section */}
      <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden mb-8 shadow-xl">
        <OptimizedImage
          src={image_url || "https://placehold.co/1200x600?text=No+Image+Available"}
          alt={name}
          className="w-full h-full object-cover"
          aspectRatio="2/1"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-8 md:p-12">
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary hover:bg-primary/90 text-white border-none px-3 py-1">
                {cuisine}
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md px-3 py-1">
                {price}
              </Badge>
              {rating && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md px-3 py-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {rating.toFixed(1)}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{name}</h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed">
              {description}
            </p>
            
            <div className="flex gap-4 pt-4">
              {social_links?.instagram && (
                <a href={social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {social_links?.facebook && (
                <a href={social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {social_links?.twitter && (
                <a href={social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {social_links?.website && (
                <a href={social_links.website} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <Globe className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="menu" className="rounded-lg">Menu</TabsTrigger>
              <TabsTrigger value="locations" className="rounded-lg">Locations</TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-lg">Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      Meet the Chef
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chef_name || name}`} />
                        <AvatarFallback>{chef_name?.[0] || 'C'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-lg">{chef_name || "Chef de Cuisine"}</h4>
                        <p className="text-sm text-muted-foreground">Executive Chef</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {chef_bio || `${name}'s culinary team is led by our executive chef, who brings years of experience from Michelin-starred kitchens to your table. Every dish is a testament to our commitment to flavor and presentation.`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HistoryIcon className="h-5 w-5 text-primary" />
                      Our Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {history || `Founded with a passion for exceptional dining, ${name} has been serving the community with dedication and style. Our journey began with a simple idea: to create a space where food and ambiance meet in perfect harmony.`}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {hasFeatures && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Amenities & Features</h3>
                  <div className="flex flex-wrap gap-3">
                    {Array.isArray(displayFeatures) ? (
                      displayFeatures.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border shadow-sm">
                          {feature}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border shadow-sm">
                        {String(displayFeatures)}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Testimonials */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  What Our Guests Say
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(testimonials || [
                    { id: '1', author: 'Sarah J.', text: 'Absolutely incredible experience. The service was impeccable and the food was out of this world.', rating: 5, date: '2 days ago' },
                    { id: '2', author: 'Michael R.', text: 'Best dining experience in the city. The ambiance is perfect for a romantic evening.', rating: 5, date: '1 week ago' }
                  ]).map((t) => (
                    <Card key={t.id} className="border-none shadow-sm bg-white">
                      <CardContent className="pt-6">
                        <Quote className="h-8 w-8 text-primary/10 mb-2" />
                        <p className="italic text-muted-foreground mb-4">"{t.text}"</p>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{t.author}</div>
                          <div className="flex gap-0.5">
                            {[...Array(t.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="menu" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DigitalMenu 
                categories={restaurant.menuCategories || []} 
                restaurantName={name}
              />
            </TabsContent>
            
            <TabsContent value="locations" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-12">
                {locations.length === 0 ? (
                  <Card className="border-dashed py-12 text-center">
                    <CardContent>
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">No locations available yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  locations.map((location) => (
                    <InteractiveRestaurantMap 
                      key={location.id}
                      location={location}
                      height="400px"
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ComprehensiveGallery 
                images={restaurant.gallery || []} 
                fallbackImage={image_url}
              />
            </TabsContent>
          </Tabs>

          <Separator className="my-12" />
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Recommended for You</h3>
            <PersonalizedRecommendations />
          </div>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6 border-none shadow-xl overflow-hidden rounded-2xl">
            <div className="bg-primary p-6 text-white">
              <CardTitle className="text-2xl">Book Your Table</CardTitle>
              <CardDescription className="text-white/80">Experience the finest dining today</CardDescription>
            </div>
            <CardContent className="p-6">
              <BookingForm 
                restaurant={restaurant} 
              />
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Today's Hours</p>
                  <p className="text-sm font-medium">11:00 AM - 10:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Perfect for</p>
                  <p className="text-sm font-medium">Romantic Dinners, Business Meetings</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Average Price</p>
                  <p className="text-sm font-medium">{price} per person</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
