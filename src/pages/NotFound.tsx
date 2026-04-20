
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ArrowLeft, Phone } from 'lucide-react';

export default function NotFound() {
  const popularPages = [
    { name: "Browse Restaurants", path: "/restaurants", icon: Search },
    { name: "Make a Reservation", path: "/restaurants", icon: Search },
    { name: "My Reservations", path: "/reservations", icon: Search },
    { name: "Help Center", path: "/help", icon: Phone },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Error Number */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-primary/20">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Oops! The page you're looking for seems to have wandered off the menu. 
            Let's get you back to discovering great restaurants.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <Button asChild size="lg" className="inline-flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="inline-flex items-center gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Popular Pages */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Popular Pages</h3>
            <div className="grid grid-cols-1 gap-2">
              {popularPages.map((page) => (
                <Button 
                  key={page.name}
                  variant="ghost" 
                  asChild 
                  className="justify-start"
                >
                  <Link to={page.path} className="inline-flex items-center gap-2">
                    <page.icon className="h-4 w-4" />
                    {page.name}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Still can't find what you're looking for?
          </p>
          <Button variant="link" asChild>
            <Link to="/contact">Contact our support team</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
