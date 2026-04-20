import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { User, LogOut, Calendar, ChefHat, Utensils, Heart, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSecurity } from '@/hooks/use-security';
import { toast } from 'sonner';

export function UserNav() {
  const { user, logout } = useAuth();
  const { securityStatus } = useSecurity();
  
  const getRoleBadge = (role: string | undefined) => {
    if (!role) return null;
    
    const roleConfig: Record<string, { label: string, color: string }> = {
      'superadmin': { label: 'Super Admin', color: 'bg-red-500 text-white' },
      'system_admin': { label: 'Admin', color: 'bg-orange-500 text-white' },
      'restaurant_owner': { label: 'Owner', color: 'bg-blue-500 text-white' },
      'restaurant_manager': { label: 'Manager', color: 'bg-indigo-500 text-white' },
      'restaurant_staff': { label: 'Staff', color: 'bg-green-500 text-white' },
      'inventory_manager': { label: 'Inventory', color: 'bg-purple-500 text-white' },
      'customer': { label: 'Customer', color: 'bg-slate-500 text-white' },
    };
    
    const config = roleConfig[role] || { label: role, color: 'bg-slate-500 text-white' };
    
    return (
      <Badge className={`${config.color} border-none font-medium px-2 py-0 h-5`}>
        {config.label}
      </Badge>
    );
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Clear any cached security data on logout
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.removeItem('security-cache');
      }
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/signup">Sign up</Link>
        </Button>
      </div>
    );
  }
  
  // UI-level role checks - Real security enforced by RLS policies on backend
  // These checks only control UI visibility, not actual data access
  const canAccessAdmin = user.role === 'system_admin' || user.role === 'superadmin';
  const canManageRestaurants = user.role === 'superadmin' || user.role === 'system_admin' || user.role === 'restaurant_owner' || user.role === 'restaurant_manager';
  
  return (
    <div className="flex items-center gap-3">
      {getRoleBadge(user.role)}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user.firstName?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
              </div>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              {user.role && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Current Role:</span>
                  {getRoleBadge(user.role)}
                </div>
              )}
              {securityStatus && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Security:</span>
                  <Badge 
                    variant={securityStatus.riskLevel === 'low' ? 'outline' : 'destructive'} 
                    className="text-[10px] px-1 py-0 h-4"
                  >
                    {securityStatus.riskLevel}
                  </Badge>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          {canAccessAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer text-orange-600 font-medium">
                <Shield className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          {canManageRestaurants && (
            <DropdownMenuItem asChild>
              <Link to="/restaurant-owner" className="cursor-pointer text-blue-600 font-medium">
                <Utensils className="mr-2 h-4 w-4" />
                Restaurant Dashboard
              </Link>
            </DropdownMenuItem>
          )}
        <DropdownMenuItem asChild>
          <Link to="/reservations">
            <Calendar className="mr-2 h-4 w-4" />
            My Reservations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favorites">
            <Heart className="mr-2 h-4 w-4" />
            My Favorites
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/chef-bookings">
            <ChefHat className="mr-2 h-4 w-4" />
            My Chef Bookings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/chefs-warehouse">
            <ChefHat className="mr-2 h-4 w-4" />
            Chefs Warehouse
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}
