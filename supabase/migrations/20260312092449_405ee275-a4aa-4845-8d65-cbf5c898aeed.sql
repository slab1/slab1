
-- 1. Rename customer_id → user_id on payments table
ALTER TABLE public.payments RENAME COLUMN customer_id TO user_id;

-- 2. Rename customer_id → user_id on orders table
-- First drop the existing FK constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders RENAME COLUMN customer_id TO user_id;

-- 3. Drop unused customer_id column from notifications (user_id already exists)
ALTER TABLE public.notifications DROP COLUMN IF EXISTS customer_id;

-- 4. Rename customer_id → user_id on security_events table
ALTER TABLE public.security_events RENAME COLUMN customer_id TO user_id;

-- 5. Rename misleading FK constraints on email_notifications and sms_notifications
ALTER TABLE public.email_notifications DROP CONSTRAINT IF EXISTS email_notifications_customer_id_fkey;
ALTER TABLE public.email_notifications ADD CONSTRAINT email_notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.sms_notifications DROP CONSTRAINT IF EXISTS sms_notifications_customer_id_fkey;
ALTER TABLE public.sms_notifications ADD CONSTRAINT sms_notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Recreate views that may reference old column names

-- Drop and recreate user_roles_with_customer view
DROP VIEW IF EXISTS public.user_roles_with_customer;
CREATE OR REPLACE VIEW public.user_roles_with_customer AS
SELECT
  ur.id,
  ur.user_id,
  ur.role,
  ur.restaurant_id,
  ur.assigned_by,
  ur.created_at,
  p.full_name,
  p.email,
  p.avatar_url
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.user_id = p.id;
