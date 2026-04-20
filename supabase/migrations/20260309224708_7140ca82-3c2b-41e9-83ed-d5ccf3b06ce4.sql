
-- =============================================
-- SECURITY FIX 1: Profiles PII exposure
-- =============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view profiles for joins" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'system_admin')
  )
);

-- =============================================
-- SECURITY FIX 2: Privilege escalation via self-role update
-- =============================================
DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;

-- =============================================
-- SECURITY FIX 3: Booking audit log exposure
-- =============================================
DROP POLICY IF EXISTS "Authenticated can read audit" ON public.booking_audit_log;

CREATE POLICY "Admins can read booking audit"
ON public.booking_audit_log FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'system_admin', 'admin')
  )
);

-- =============================================
-- SECURITY FIX 4: is_admin_user() grants too much access
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'system_admin')
  );
$$;

-- =============================================
-- SECURITY FIX 5: restaurant_waitlist_settings self-join bug
-- =============================================
DROP POLICY IF EXISTS "restaurant_waitlist_settings_select" ON public.restaurant_waitlist_settings;
DROP POLICY IF EXISTS "restaurant_waitlist_settings_insert" ON public.restaurant_waitlist_settings;
DROP POLICY IF EXISTS "restaurant_waitlist_settings_update" ON public.restaurant_waitlist_settings;
DROP POLICY IF EXISTS "restaurant_waitlist_settings_delete" ON public.restaurant_waitlist_settings;

CREATE POLICY "restaurant_waitlist_settings_select" ON public.restaurant_waitlist_settings
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = restaurant_waitlist_settings.restaurant_id
  )
);

CREATE POLICY "restaurant_waitlist_settings_insert" ON public.restaurant_waitlist_settings
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = restaurant_waitlist_settings.restaurant_id
    AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner', 'restaurant_manager')
  )
);

CREATE POLICY "restaurant_waitlist_settings_update" ON public.restaurant_waitlist_settings
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = restaurant_waitlist_settings.restaurant_id
    AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner', 'restaurant_manager')
  )
);

CREATE POLICY "restaurant_waitlist_settings_delete" ON public.restaurant_waitlist_settings
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = restaurant_waitlist_settings.restaurant_id
    AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner')
  )
);

-- =============================================
-- SECURITY FIX 6: restaurant_appearance_settings self-join bug
-- =============================================
DROP POLICY IF EXISTS "restaurant_appearance_settings_select" ON public.restaurant_appearance_settings;
DROP POLICY IF EXISTS "restaurant_appearance_settings_insert" ON public.restaurant_appearance_settings;
DROP POLICY IF EXISTS "restaurant_appearance_settings_update" ON public.restaurant_appearance_settings;
DROP POLICY IF EXISTS "restaurant_appearance_settings_delete" ON public.restaurant_appearance_settings;

CREATE POLICY "restaurant_appearance_settings_select" ON public.restaurant_appearance_settings
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = restaurant_appearance_settings.restaurant_id
  )
);

CREATE POLICY "restaurant_appearance_settings_insert" ON public.restaurant_appearance_settings
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = restaurant_appearance_settings.restaurant_id
    AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner', 'restaurant_manager')
  )
);

CREATE POLICY "restaurant_appearance_settings_update" ON public.restaurant_appearance_settings
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = restaurant_appearance_settings.restaurant_id
    AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner', 'restaurant_manager')
  )
);

CREATE POLICY "restaurant_appearance_settings_delete" ON public.restaurant_appearance_settings
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = restaurant_appearance_settings.restaurant_id
    AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner')
  )
);

-- =============================================
-- SECURITY FIX 7: waitlist self-join bug (uses customer_id not user_id)
-- =============================================
DROP POLICY IF EXISTS "waitlist_select" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_insert" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_update" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_delete" ON public.waitlist;

CREATE POLICY "waitlist_select" ON public.waitlist
FOR SELECT TO authenticated
USING (
  auth.uid() = customer_id
  OR EXISTS (
    SELECT 1 FROM public.restaurant_staff rs
    WHERE rs.user_id = auth.uid()
    AND rs.restaurant_id = waitlist.restaurant_id
  )
);

CREATE POLICY "waitlist_insert" ON public.waitlist
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = customer_id
  OR EXISTS (
    SELECT 1 FROM public.restaurant_staff rs
    WHERE rs.user_id = auth.uid()
    AND rs.restaurant_id = waitlist.restaurant_id
  )
);

CREATE POLICY "waitlist_update" ON public.waitlist
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_staff rs
    WHERE rs.user_id = auth.uid()
    AND rs.restaurant_id = waitlist.restaurant_id
  )
);

CREATE POLICY "waitlist_delete" ON public.waitlist
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_staff rs
    WHERE rs.user_id = auth.uid()
    AND rs.restaurant_id = waitlist.restaurant_id
  )
);

-- =============================================
-- SECURITY FIX 8: stock_levels self-join bug
-- =============================================
DROP POLICY IF EXISTS "stock_levels_insert" ON public.stock_levels;
DROP POLICY IF EXISTS "stock_levels_update" ON public.stock_levels;

CREATE POLICY "stock_levels_insert" ON public.stock_levels
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = stock_levels.restaurant_id
    AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner', 'restaurant_manager', 'inventory_manager', 'restaurant_staff')
  )
);

CREATE POLICY "stock_levels_update" ON public.stock_levels
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.restaurant_id = stock_levels.restaurant_id
    AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner', 'restaurant_manager', 'inventory_manager', 'restaurant_staff')
  )
);

-- =============================================
-- SECURITY FIX 9: is_restaurant_owner() uses wrong column
-- =============================================
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(target_restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE id = target_restaurant_id
    AND owner_id = auth.uid()
  );
$$;
