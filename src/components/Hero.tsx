
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Utensils, ChevronRight, Star } from 'lucide-react';
import { RestaurantSearch } from './RestaurantSearch';
import { useNavigate } from 'react-router-dom';
import { OptimizedImage } from './ui/optimized-image';

export function Hero() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/restaurants?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform animate-spin-slow" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-2 mb-8 animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              <Utensils className="w-4 h-4 mr-2" />
              Discover Amazing Dining Experiences
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text" style={{ animationDelay: '100ms' }}>
            Find your perfect table for any{' '}
            <span className="text-primary relative">
              occasion
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-primary/20" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,20 Q25,0 50,20 Q75,0 100,20" fill="currentColor" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-fade-up max-w-3xl mx-auto leading-relaxed" style={{ animationDelay: '200ms' }}>
            Discover exceptional restaurants, check real-time availability, and secure your reservation instantly. 
            No more waiting on hold – just seamless dining experiences at your fingertips.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="glassmorphism rounded-2xl p-6 border border-white/20 shadow-elevation">
              <RestaurantSearch onSearch={handleSearch} />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <Button asChild size="lg" className="w-full sm:w-auto text-base font-medium px-8 h-12">
              <Link to="/restaurants" className="flex items-center">
                Browse All Restaurants
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base group px-8 h-12">
              <Link to="/restaurants/enhanced" className="flex items-center">
                <Search className="w-5 h-5 mr-2 transition-transform group-hover:-rotate-12" /> 
                Advanced Search
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Hero Image Section */}
        <div className="relative mx-auto max-w-6xl animate-scale-in" style={{ animationDelay: '500ms' }}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Featured Image */}
            <div className="md:col-span-2 aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <OptimizedImage 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=60" 
                alt="Elegant restaurant dining experience" 
                className="w-full h-full object-cover object-center transition-all duration-700 hover:scale-105"
                aspectRatio="16/10"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            </div>
            
            {/* Side Images */}
            <div className="space-y-6">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/20">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop&q=60&auto=format" 
                  alt="Delicious cuisine" 
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  aspectRatio="1/1"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/20">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop" 
                  alt="Restaurant ambiance" 
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                  aspectRatio="1/1"
                />
              </div>
            </div>
          </div>
          
          {/* Floating Stats Card */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-11/12 max-w-4xl">
            <div className="glassmorphism rounded-xl shadow-card p-6 grid grid-cols-3 gap-4 border border-white/20">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <p className="text-3xl md:text-4xl font-bold text-primary">500+</p>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Premium Restaurants</p>
              </div>
              <div className="text-center border-x border-border">
                <div className="flex items-center justify-center mb-2">
                  <p className="text-3xl md:text-4xl font-bold text-primary">4.9</p>
                  <Star className="w-6 h-6 text-yellow-500 fill-current ml-1" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <p className="text-3xl md:text-4xl font-bold text-primary">24/7</p>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Instant Booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
