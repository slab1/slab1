
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, MapPin, Star, ArrowRight, Search, Users, Award, TrendingUp } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Hero } from '@/components/Hero';
import { PersonalizedRecommendations } from '@/components/recommendations/PersonalizedRecommendations';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Link } from 'react-router-dom';

export default function Index() {
  const { user } = useAuth();
  
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <Hero />

        {/* Personalized Recommendations */}
        {user && (
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <PersonalizedRecommendations />
            </div>
          </section>
        )}

        {/* Popular Cuisines */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Explore Popular Cuisines</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover amazing flavors from around the world
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Italian", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop", restaurants: "150+" },
                { name: "Japanese", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop", restaurants: "80+" },
                { name: "Mexican", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop", restaurants: "120+" },
                { name: "French", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop", restaurants: "60+" }
              ].map((cuisine) => (
                <Link 
                  key={cuisine.name}
                  to={`/restaurants?cuisine=${cuisine.name.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-xl aspect-[4/3] card-hover"
                >
                  <OptimizedImage 
                    src={cuisine.image} 
                    alt={cuisine.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold mb-1">{cuisine.name}</h3>
                    <p className="text-sm opacity-90">{cuisine.restaurants} restaurants</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Reservatoo?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The easiest way to discover and book amazing dining experiences
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Booking</h3>
                <p className="text-muted-foreground">
                  Skip the phone calls. Book your table instantly with real-time availability
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Discovery</h3>
                <p className="text-muted-foreground">
                  Find restaurants that match your taste with our intelligent recommendation system
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quality Guaranteed</h3>
                <p className="text-muted-foreground">
                  Curated selection of the best restaurants with verified reviews and ratings
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Trusted by Food Lovers Everywhere</h2>
            
            <div className="grid gap-8 md:grid-cols-3 mb-12">
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <p className="opacity-90">Happy Customers</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <p className="opacity-90">Partner Restaurants</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50K+</div>
                <p className="opacity-90">Reservations Made</p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <blockquote className="text-xl italic mb-6">
                "Reservatoo made it so easy to find and book the perfect restaurant for our anniversary. 
                The recommendations were spot-on and the booking process was seamless!"
              </blockquote>
              <div className="flex items-center justify-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="ml-2 opacity-90">- Sarah M., Verified Customer</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Great Meal?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of food lovers who trust Reservatoo for their dining experiences
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/restaurants">
                  Browse Restaurants
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              {!user && (
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link to="/signup">
                    Sign Up Free
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}
