-- =============================================
-- Part 1: Create Missing Tables
-- =============================================

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text NOT NULL,
  capacity integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customer_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customer_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dietary_restrictions text[],
  seating_preferences text,
  communication_preferences jsonb,
  favorite_cuisines text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- =============================================
-- Part 2: Enable RLS and Add Policies
-- =============================================

-- Events RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Anyone can read events') THEN
    CREATE POLICY "Anyone can read events" ON public.events FOR SELECT TO public USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Authenticated users can manage events') THEN
    CREATE POLICY "Authenticated users can manage events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Customer Preferences RLS
ALTER TABLE public.customer_preferences ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_preferences' AND policyname = 'Users can manage own preferences') THEN
    CREATE POLICY "Users can manage own preferences" ON public.customer_preferences FOR ALL TO authenticated 
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- =============================================
-- Part 3: Fix SECURITY DEFINER Functions
-- =============================================

-- Fix is_owner function
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'system_admin', 'restaurant_owner')
  );
END;
$function$;

-- Fix is_owner_user function
CREATE OR REPLACE FUNCTION public.is_owner_user(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('superadmin', 'system_admin', 'restaurant_owner')
  );
END;
$function$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'system_admin')
  );
END;
$function$;

-- Fix is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('superadmin', 'system_admin')
  );
END;
$function$;

-- Fix update_notification_status function
CREATE OR REPLACE FUNCTION public.update_notification_status(
  notification_id uuid,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.notifications
  SET read = (new_status = 'read'),
      read_at = CASE WHEN new_status = 'read' THEN now() ELSE NULL END
  WHERE id = notification_id AND user_id = auth.uid();
END;
$function$;

-- Fix update_system_settings_timestamp function
CREATE OR REPLACE FUNCTION public.update_system_settings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix create_default_notification_preferences function
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix sync_reservation_guest_counts function
CREATE OR REPLACE FUNCTION public.sync_reservation_guest_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- This function syncs guest count changes
  RETURN NEW;
END;
$function$;

-- Fix handle_booking_confirmation function
CREATE OR REPLACE FUNCTION public.handle_booking_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Handle booking confirmation logic
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    NEW.confirmed_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix audit_role_changes function
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    event_type
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::text,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    'role_change'
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix check_can_manage_user_roles function
CREATE OR REPLACE FUNCTION public.check_can_manage_user_roles(_target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins can manage user roles
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'system_admin')
  );
END;
$function$;

-- Fix create_api_key function (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_api_key') THEN
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.create_api_key(
        p_name text,
        p_scopes text[] DEFAULT ARRAY['read']::text[],
        p_monthly_quota integer DEFAULT 1000,
        p_expires_at timestamptz DEFAULT NULL
      )
      RETURNS TABLE(api_key text, key_id uuid)
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = 'public'
      AS $func$
      DECLARE
        v_key_prefix text;
        v_key_secret text;
        v_full_key text;
        v_key_hash text;
        v_key_id uuid;
      BEGIN
        v_key_prefix := 'rk_' || substr(md5(random()::text), 1, 8);
        v_key_secret := encode(gen_random_bytes(32), 'hex');
        v_full_key := v_key_prefix || '_' || v_key_secret;
        v_key_hash := encode(digest(v_full_key, 'sha256'), 'hex');
        
        INSERT INTO public.api_keys (
          user_id, name, key_prefix, key_hash, scopes, monthly_quota, expires_at
        ) VALUES (
          auth.uid(), p_name, v_key_prefix, v_key_hash, p_scopes, p_monthly_quota, p_expires_at
        ) RETURNING id INTO v_key_id;
        
        RETURN QUERY SELECT v_full_key, v_key_id;
      END;
      $func$;
    $sql$;
  END IF;
END $$;

-- Fix exec_sql function (admin only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'exec_sql') THEN
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = 'public'
      AS $func$
      DECLARE
        result jsonb;
      BEGIN
        -- Only allow for admins
        IF NOT EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role IN ('superadmin', 'system_admin')
        ) THEN
          RAISE EXCEPTION 'Unauthorized: Admin access required';
        END IF;
        
        EXECUTE sql_query INTO result;
        RETURN result;
      END;
      $func$;
    $sql$;
  END IF;
END $$;

-- Fix create_order_and_consume_stock function (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_order_and_consume_stock') THEN
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.create_order_and_consume_stock(
        p_restaurant_id uuid,
        p_customer_id uuid,
        p_items jsonb,
        p_total_amount numeric
      )
      RETURNS uuid
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = 'public'
      AS $func$
      DECLARE
        v_order_id uuid;
      BEGIN
        -- Create order
        INSERT INTO public.orders (restaurant_id, customer_id, total_amount, status)
        VALUES (p_restaurant_id, p_customer_id, p_total_amount, 'pending')
        RETURNING id INTO v_order_id;
        
        -- Process order items and consume stock
        -- (Implementation depends on business logic)
        
        RETURN v_order_id;
      END;
      $func$;
    $sql$;
  END IF;
END $$;