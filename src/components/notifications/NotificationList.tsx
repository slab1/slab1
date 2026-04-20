import React from 'react';
import { Bell, Check, AlertCircle, Info, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

import { useNavigate } from 'react-router-dom';

const NotificationList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useRealtimeNotifications();

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
        // Stay on notifications tab
        break;
      case 'special_offer':
        if (data.restaurant_id) {
          navigate(`/restaurants/${data.restaurant_id}`);
        } else {
          navigate('/restaurants');
        }
        break;
      default:
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reservation_confirmed':
      case 'table_ready':
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'reservation_cancelled':
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'reservation_reminder':
      case 'new_booking':
      case 'special_offer':
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">Your Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="h-6">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllAsRead()}
                className="text-xs"
              >
                Mark all read
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => clearAll()}
                className="text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Clear all
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground">We'll notify you when something important happens.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-muted/30 transition-colors cursor-pointer group ${
                  !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className={`text-base truncate ${!notification.read ? 'font-bold' : 'font-semibold'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-4 w-4" /> Mark read
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
    </Card>
  );
};

export default NotificationList;
