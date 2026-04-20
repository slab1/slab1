import { cn } from '@/lib/utils';
import { Check, Clock, Circle, X, PartyPopper, CreditCard, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEvent {
  status: string;
  label: string;
  description: string;
  date?: string;
  active: boolean;
  completed: boolean;
  icon: React.ReactNode;
}

interface EventStatusTimelineProps {
  status: string;
  paymentStatus: string;
  createdAt: string;
  eventDate: string;
}

export function EventStatusTimeline({ status, paymentStatus, createdAt, eventDate }: EventStatusTimelineProps) {
  const getTimeline = (): TimelineEvent[] => {
    const isCancelled = status === 'cancelled';

    const events: TimelineEvent[] = [
      {
        status: 'submitted',
        label: 'Request Submitted',
        description: `Your event request was received`,
        date: createdAt,
        active: false,
        completed: true,
        icon: <Check className="h-4 w-4" />,
      },
      {
        status: 'review',
        label: 'Under Review',
        description: 'Our events team is reviewing your request',
        active: status === 'pending',
        completed: status !== 'pending',
        icon: status === 'pending' ? <Clock className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />,
      },
    ];

    if (isCancelled) {
      events.push({
        status: 'cancelled',
        label: 'Cancelled',
        description: 'This event request was cancelled',
        active: true,
        completed: false,
        icon: <X className="h-4 w-4" />,
      });
      return events;
    }

    events.push(
      {
        status: 'confirmed',
        label: 'Confirmed',
        description: 'Event confirmed! Deposit received.',
        active: status === 'confirmed' && paymentStatus === 'deposit_paid',
        completed: status === 'confirmed' || status === 'completed',
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        status: 'finalized',
        label: 'Details Finalized',
        description: 'Menu, setup, and logistics confirmed',
        active: status === 'confirmed' && paymentStatus === 'fully_paid',
        completed: status === 'completed',
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        status: 'event_day',
        label: 'Event Day',
        description: format(new Date(eventDate), 'EEEE, MMMM d, yyyy'),
        active: false,
        completed: status === 'completed',
        icon: <PartyPopper className="h-4 w-4" />,
      }
    );

    return events;
  };

  const timeline = getTimeline();

  return (
    <div className="relative">
      {timeline.map((event, index) => {
        const isLast = index === timeline.length - 1;
        const isCancelledItem = event.status === 'cancelled';

        return (
          <div key={event.status} className="flex gap-4 pb-6 last:pb-0">
            {/* Connector line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors',
                  event.completed && !isCancelledItem && 'bg-primary border-primary text-primary-foreground',
                  event.active && !isCancelledItem && 'border-primary bg-primary/10 text-primary',
                  isCancelledItem && 'border-destructive bg-destructive/10 text-destructive',
                  !event.completed && !event.active && !isCancelledItem && 'border-muted-foreground/20 text-muted-foreground/40'
                )}
              >
                {event.completed && !isCancelledItem ? <Check className="h-4 w-4" /> : event.icon}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 mt-1',
                    event.completed ? 'bg-primary' : 'bg-muted-foreground/15'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="pt-1 pb-2 min-w-0">
              <h4
                className={cn(
                  'text-sm font-semibold',
                  event.active && 'text-primary',
                  isCancelledItem && 'text-destructive',
                  !event.completed && !event.active && !isCancelledItem && 'text-muted-foreground'
                )}
              >
                {event.label}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
              {event.date && (
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  {format(new Date(event.date), 'MMM d, yyyy · h:mm a')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
