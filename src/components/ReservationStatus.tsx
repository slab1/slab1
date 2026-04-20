
import React from 'react';
import { Check, Clock, X, Calendar, CalendarCheck, CalendarX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReservationStatusProps {
  status: string;
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ReservationStatus({
  status,
  className,
  showIcon = true,
  showLabel = true,
  size = 'md'
}: ReservationStatusProps) {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return {
          icon: <CalendarCheck />,
          label: 'Confirmed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: <Clock />,
          label: 'Pending',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200'
        };
      case 'cancelled':
        return {
          icon: <CalendarX />,
          label: 'Cancelled',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      case 'completed':
        return {
          icon: <Check />,
          label: 'Completed',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'payment_pending':
        return {
          icon: <Clock />,
          label: 'Payment Pending',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          icon: <Calendar />,
          label: status.charAt(0).toUpperCase() + status.slice(1),
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      config.bgColor,
      config.textColor,
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <span className={iconSizes[size]}>
          {React.cloneElement(config.icon as React.ReactElement, { 
            className: cn(iconSizes[size], 'shrink-0')
          })}
        </span>
      )}
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
