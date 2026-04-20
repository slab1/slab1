
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_HIERARCHY, ROLE_GROUP_DISPLAY } from "@/api/types";
import {
  LayoutDashboard,
  Users,
  StarOff,
  Utensils,
  CalendarDays,
  MapPin,
  CreditCard,
  LogOut,
  LifeBuoy,
  Database,
  Activity,
  BarChart3,
  Target,
  TrendingUp,
  Settings,
  Search,
  Megaphone,
  History,
  ShieldCheck,
  Terminal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SystemStatusIndicator } from "@/components/common/SystemStatusIndicator";

interface AdminSidebarProps {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    avatar_url?: string;
    phone?: string;
    address?: string;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
  canManageUsers: boolean;
  canCreateDemoPayments: boolean;
  canManageDatabase: boolean;
  canManageStaff: boolean;
  isRestaurantOwner?: boolean; // Optional prop for restaurant owner check
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  activeTab,
  onTabChange,
  canManageUsers,
  canCreateDemoPayments,
  canManageDatabase,
  canManageStaff,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const getInitials = () => {
    if (!user?.email) return "U";
    const nameParts = user.email.split('@')[0].split('.');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getRoleGroup = (role: string): string => {
    const roleInfo = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
    return ROLE_GROUP_DISPLAY[roleInfo?.group] || 'Customer';
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'superadmin': 'Super Admin',
      'system_admin': 'System Admin',
      'restaurant_owner': 'Restaurant Owner',
      'restaurant_manager': 'Restaurant Manager',
      'restaurant_staff': 'Staff',
      'inventory_manager': 'Inventory Manager',
      'customer': 'Customer'
    };
    return roleNames[role] || role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRolePriority = (role: string) => {
    const roleInfo = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
    return roleInfo?.level || 0;
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const menuGroups = [
    {
      label: "Overview",
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard,
          show: true
        },
        {
          id: 'analytics',
          label: 'Advanced Analytics',
          icon: BarChart3,
          show: true
        },
        {
          id: 'business-intelligence',
          label: 'Business Intelligence',
          icon: Target,
          show: canManageUsers || user.role === 'system_admin' || user.role === 'superadmin'
        },
      ]
    },
    {
      label: "Management",
      items: [
        {
          id: 'restaurants',
          label: 'Restaurants',
          icon: Utensils,
          show: true
        },

        {
          id: 'locations',
          label: 'Locations',
          icon: MapPin,
          show: true
        },
        {
          id: 'users',
          label: 'Users',
          icon: Users,
          show: canManageUsers
        },
        {
          id: 'staff',
          label: 'Staff',
          icon: StarOff,
          show: canManageStaff
        },
        {
          id: 'restaurant-owner',
          label: 'Restaurant Owner',
          icon: Utensils,
          show: user.role === 'restaurant_owner' || user.role === 'restaurant_manager' || user.role === 'system_admin' || user.role === 'superadmin'
        },

      ]
    },
    {
      label: "Operations",
      items: [
        {
          id: 'reservations',
          label: 'Reservations',
          icon: CalendarDays,
          show: true
        },
        {
          id: 'quick-book',
          label: 'Quick Book',
          icon: CalendarDays,
          show: user.role === 'superadmin' || user.role === 'system_admin' || user.role === 'restaurant_owner' || user.role === 'restaurant_manager',
          action: () => navigate('/restaurants')
        },
        {
          id: 'reviews',
          label: 'Reviews',
          icon: TrendingUp,
          show: user.role === 'system_admin' || user.role === 'superadmin'
        },
        {
          id: 'marketing',
          label: 'Marketing',
          icon: Megaphone,
          show: user.role === 'system_admin' || user.role === 'superadmin'
        },
        {
          id: 'loyalty',
          label: 'Loyalty',
          icon: Target,
          show: user.role === 'system_admin' || user.role === 'superadmin'
        },
        {
          id: 'demo-payments',
          label: 'Demo Payments',
          icon: CreditCard,
          show: canCreateDemoPayments
        },
      ]
    },
    {
      label: "System",
      items: [
        {
          id: 'audit-logs',
          label: 'Audit Logs',
          icon: History,
          show: canManageDatabase
        },
        {
          id: 'health',
          label: 'System Health',
          icon: Activity,
          show: true
        },
        {
          id: 'subscriptions',
          label: 'Subscriptions',
          icon: CreditCard,
          show: user.role === 'superadmin' || user.role === 'system_admin'
        },
        {
          id: 'testing-panel',
          label: 'Testing Panel',
          icon: ShieldCheck,
          show: user.role === 'superadmin' || user.role === 'system_admin'
        },
        {
          id: 'database',
          label: 'Database Manager',
          icon: Database,
          show: user.role === 'superadmin' || user.role === 'system_admin'
        },
        {
          id: 'system-config',
          label: 'System Config',
          icon: Settings,
          show: user.role === 'superadmin' || user.role === 'system_admin'
        },
        {
          id: 'developer',
          label: 'Developer',
          icon: Terminal,
          show: user.role === 'superadmin' || user.role === 'system_admin'
        }
      ]
    }
  ];

  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.show && 
      (searchTerm === "" || item.label.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="flex flex-col items-center justify-center pt-6 space-y-4">
        <div className="flex flex-col items-center space-y-2 px-4 py-2">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold tracking-tight">
              {user.name || user.email.split('@')[0]}
            </h2>
            <div className="flex flex-col items-center space-y-1">
              <p className="text-xs text-muted-foreground">
                {getRoleDisplayName(user.role)} Account
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  Group: {getRoleGroup(user.role)}
                </span>
                <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary-foreground rounded-full">
                  Priority: {getRolePriority(user.role)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full px-4 relative">
          <Search className="absolute left-6 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tools..." 
            className="pl-8 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {filteredGroups.map((group, index) => (
          <div key={index} className="py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
              {group.label}
            </h3>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    className={activeTab === item.id ? "bg-accent text-accent-foreground" : ""}
                    onClick={() => (item as any).action ? (item as any).action() : onTabChange(item.id)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {index < filteredGroups.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 pt-2">
          <SystemStatusIndicator />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/help")}>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="text-red-500 hover:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-between px-4 py-2 mt-2">
          <div className="text-xs text-muted-foreground">
            Admin Dashboard
            <p className="text-[10px]">v2.1.0 • Enterprise</p>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
