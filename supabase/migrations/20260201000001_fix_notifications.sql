
-- Migration to fix notification systems and relation tables
-- 1. Fix missing foreign keys for push_subscriptions and notifications
DO $$ 
BEGIN
    -- Fix push_subscriptions user_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'push_subscriptions_user_id_fkey'
    ) THEN
        ALTER TABLE public.push_subscriptions
        ADD CONSTRAINT push_subscriptions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;

    -- Fix notifications user_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE public.notifications
        ADD CONSTRAINT notifications_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Update notification types to include staff scheduling
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'reservation_confirmed',
        'reservation_cancelled',
        'table_ready',
        'special_offer',
        'review_response',
        'new_booking',
        'reservation_reminder',
        'system_announcement',
        'staff_assigned',
        'schedule_update',
        'shift_reminder',
        'staff_invitation'
    ));

-- 3. Enhance RLS policies for better security
-- Drop overly broad policies
DROP POLICY IF EXISTS "System can insert notifications for users" ON public.notifications;
DROP POLICY IF EXISTS "System can insert email notifications" ON public.email_notifications;
DROP POLICY IF EXISTS "System can update email notification status" ON public.email_notifications;
DROP POLICY IF EXISTS "System can insert SMS notifications" ON public.sms_notifications;
DROP POLICY IF EXISTS "System can update SMS notification status" ON public.sms_notifications;

-- Create more restricted policies
-- Notifications
CREATE POLICY "System can manage notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('superadmin', 'system_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('superadmin', 'system_admin')
    )
);

-- Email notifications
CREATE POLICY "System and admins can manage email notifications"
ON public.email_notifications
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('superadmin', 'system_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('superadmin', 'system_admin')
    )
);

-- SMS notifications
CREATE POLICY "System and admins can manage SMS notifications"
ON public.sms_notifications
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('superadmin', 'system_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('superadmin', 'system_admin')
    )
);

-- Allow users to update their own notification read status
CREATE POLICY "Users can mark their own notifications as read"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Fix notification_preferences defaults and triggers
-- Create notification_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    booking_confirmations BOOLEAN DEFAULT true,
    reservation_reminders BOOLEAN DEFAULT true,
    special_offers BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS for notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.notification_preferences;
CREATE POLICY "Users can view their own preferences"
ON public.notification_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.notification_preferences;
CREATE POLICY "Users can update their own preferences"
ON public.notification_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure the trigger uses profiles if possible, or keep auth.users but make it robust
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_preferences'
    ) THEN
        CREATE TRIGGER on_auth_user_created_preferences
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_preferences();
    END IF;
END $$;

-- 5. Add delivery status update function for external providers
CREATE OR REPLACE FUNCTION public.update_notification_status(
    p_notification_id UUID,
    p_type TEXT, -- 'email' or 'sms'
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL,
    p_provider_message_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_type = 'email' THEN
        UPDATE public.email_notifications
        SET 
            status = p_status,
            error_message = p_error_message,
            provider_message_id = p_provider_message_id,
            updated_at = now(),
            sent_at = CASE WHEN p_status = 'sent' THEN now() ELSE sent_at END,
            delivered_at = CASE WHEN p_status = 'delivered' THEN now() ELSE delivered_at END
        WHERE id = p_notification_id;
    ELSIF p_type = 'sms' THEN
        UPDATE public.sms_notifications
        SET 
            status = p_status,
            error_message = p_error_message,
            provider_message_id = p_provider_message_id,
            updated_at = now(),
            sent_at = CASE WHEN p_status = 'sent' THEN now() ELSE sent_at END,
            delivered_at = CASE WHEN p_status = 'delivered' THEN now() ELSE delivered_at END
        WHERE id = p_notification_id;
    ELSE
        RETURN FALSE;
    END IF;
    RETURN TRUE;
END;
$$;

-- 6. Fix bugs in staff scheduling policies
DROP POLICY IF EXISTS "Partners can manage their own shift types" ON public.shift_types;
DROP POLICY IF EXISTS "Partners can manage their own staff schedules" ON public.staff_schedules;

CREATE POLICY "Partners can manage their own shift types" ON public.shift_types
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM public.restaurants WHERE admin_id = auth.uid()
            OR id IN (SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND role IN ('manager', 'owner'))
        )
    );

CREATE POLICY "Partners can manage their own staff schedules" ON public.staff_schedules
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM public.restaurants WHERE admin_id = auth.uid()
            OR id IN (SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND role IN ('manager', 'owner'))
        )
    );

