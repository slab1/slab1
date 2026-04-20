
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/UserNav';
import NotificationSystem from '@/components/notifications/NotificationSystem';
import { useAuth } from '@/hooks/use-auth';
import { Utensils } from 'lucide-react';

export function EnhancedHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              ReserveEats
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/restaurants"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Restaurants
            </Link>
            <Link
              to="/chefs-warehouse"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Chef Services
            </Link>
            <Link
              to="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Contact
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component can be added here */}
          </div>
          <nav className="flex items-center space-x-2">
            {user && <NotificationSystem />}
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
