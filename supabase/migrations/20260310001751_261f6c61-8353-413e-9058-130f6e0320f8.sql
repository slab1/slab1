-- Drop the existing check constraint and recreate with all notification types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IN (
    'reservation_confirmed', 'reservation_cancelled', 'table_ready', 'special_offer',
    'review_response', 'new_booking', 'reservation_reminder', 'system_announcement',
    'staff_assigned', 'schedule_update', 'shift_reminder', 'staff_invitation',
    'booking_confirmation', 'booking_cancellation', 'reminder', 'cancellation',
    'waitlist_update', 'review_request', 'system_notification', 'system_alert',
    'loyalty_update', 'payment_confirmation', 'general'
  )
);