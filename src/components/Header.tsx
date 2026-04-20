import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { UserNav } from "./UserNav";
import { useAuth } from "@/hooks/use-auth";
import { RestaurantSearch } from "./RestaurantSearch";
import { ThemeToggle } from "./ThemeToggle";
import { ReactNode } from "react";

interface HeaderProps {
  notificationCenter?: ReactNode;
}

export function Header({ notificationCenter }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/restaurants?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="text-xl font-bold text-primary">
              Reservatoo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/restaurants" className="text-foreground/80 hover:text-foreground">
              Discover
            </Link>
            <Link to="/favorites" className="text-foreground/80 hover:text-foreground">
              Favorites
            </Link>
            <Link to="/restaurants/compare" className="text-foreground/80 hover:text-foreground">
              Compare
            </Link>
            <Link to="/about" className="text-foreground/80 hover:text-foreground">
              About
            </Link>
            <Link to="/contact" className="text-foreground/80 hover:text-foreground">
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <RestaurantSearch onSearch={handleSearch} />
          </div>

          {/* Right Side - Theme, Notifications and User */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {notificationCenter}
            
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="hidden md:block h-8 w-20 bg-muted animate-pulse rounded" />
              </div>
            ) : user ? (
              <UserNav />
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <div className="lg:hidden mb-4">
              <RestaurantSearch onSearch={handleSearch} />
            </div>
            
            <Link
              to="/restaurants"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Discover Restaurants
            </Link>
            <Link
              to="/favorites"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              My Favorites
            </Link>
            <Link
              to="/restaurants/compare"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Compare Restaurants
            </Link>
            <Link
              to="/about"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {!user && (
              <div className="pt-4 space-y-2">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
// This component serves as the main header for the application, providing navigation links, a search bar, and user authentication options.
// It is responsive, adapting to different screen sizes with a mobile menu toggle.
