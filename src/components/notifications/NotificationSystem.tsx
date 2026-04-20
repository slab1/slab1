import React, { useState } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { useNavigate } from 'react-router-dom';

const NotificationSystem: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useRealtimeNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'reservation_confirmed':
      case 'table_ready':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reservation_cancelled':
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'reservation_reminder':
      case 'new_booking':
      case 'special_offer':
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read first
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigation logic based on type
    const data = notification.data || {};
    
    switch (notification.type) {
      case 'reservation_confirmed':
      case 'reservation_cancelled':
      case 'reservation_reminder':
      case 'table_ready':
      case 'new_booking':
        if (data.id) {
          navigate(`/reservation/${data.id}`);
        } else {
          navigate('/profile?tab=reservations');
        }
        break;
      case 'staff_assigned':
      case 'schedule_update':
      case 'shift_reminder':
        navigate('/staff-dashboard');
        break;
      case 'staff_invitation':
        navigate('/profile?tab=notifications');
        break;
      case 'special_offer':
        if (data.restaurant_id) {
          navigate(`/restaurants/${data.restaurant_id}`);
        } else {
          navigate('/restaurants');
        }
        break;
      case 'system_announcement':
        // Stay on current page or go to help/about
        break;
      default:
        // No specific navigation
        break;
    }
    
    setIsOpen(false);
  };

  if (authLoading || !user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-2 border-background"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 z-50 animate-in fade-in zoom-in duration-200">
            <Card className="shadow-xl border-border/50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAllAsRead()}
                        className="text-xs h-8 px-2 hover:text-primary"
                      >
                        Mark all read
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => clearAll()}
                        className="h-8 w-8 hover:text-destructive"
                        title="Clear all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:text-primary" 
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/profile?tab=notifications');
                    }}
                    title="Notification Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-0 max-h-[450px] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Bell className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No notifications yet</p>
                      <p className="text-xs text-muted-foreground">We'll notify you when something important happens.</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer group ${
                          !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h4 className={`text-sm truncate ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="h-3 w-3" /> Mark read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {notifications.length > 0 && (
                <div className="p-2 border-t bg-muted/10 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-[10px] h-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/profile?tab=notifications');
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSystem;
