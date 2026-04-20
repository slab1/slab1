-- 1. Fix waitlist: drop old duplicates and broken self-join policies
DROP POLICY IF EXISTS "waitlist_select" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_insert" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_update" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_delete" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_owner_staff_admin" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_insert_owner_staff_service" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_update_owner_staff_admin" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_delete_staff_admin_only" ON public.waitlist;

CREATE POLICY "waitlist_select_policy" ON public.waitlist
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = waitlist.restaurant_id AND rs.user_id = auth.uid()
    )
  );

CREATE POLICY "waitlist_insert_policy" ON public.waitlist
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = waitlist.restaurant_id AND rs.user_id = auth.uid()
    )
  );

CREATE POLICY "waitlist_update_policy" ON public.waitlist
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = waitlist.restaurant_id AND rs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = waitlist.restaurant_id AND rs.user_id = auth.uid()
    )
  );

CREATE POLICY "waitlist_delete_policy" ON public.waitlist
  FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = waitlist.restaurant_id AND rs.user_id = auth.uid()
    )
  );

-- 2. Fix can_view_all_roles — admin only
CREATE OR REPLACE FUNCTION public.can_view_all_roles()
  RETURNS boolean AS $$
  BEGIN
    RETURN public.is_admin();
  END;
  $$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 3. Fix compliance_documents
DROP POLICY IF EXISTS "compliance_documents_read" ON public.compliance_documents;
CREATE POLICY "compliance_documents_read" ON public.compliance_documents
  FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
  ));

-- 4. Fix usage_analytics
DROP POLICY IF EXISTS "usage_analytics_read" ON public.usage_analytics;
DROP POLICY IF EXISTS "usage_analytics_select" ON public.usage_analytics;
CREATE POLICY "usage_analytics_read" ON public.usage_analytics
  FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
  ));

-- 5. Fix special_events privilege escalation
DROP POLICY IF EXISTS "Users can create special event requests" ON public.special_events;
CREATE POLICY "Users can create special event requests" ON public.special_events
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = user_id AND user_is_admin = false)
    OR public.is_admin()
  );

-- 6. Fix handle_new_user to populate full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
    VALUES (
      new.id, new.email,
      COALESCE(new.raw_user_meta_data->>'full_name',
        TRIM(COALESCE(new.raw_user_meta_data->>'first_name','') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name',''))),
      COALESCE(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'full_name', ''),
      COALESCE(new.raw_user_meta_data->>'last_name', '')
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.loyalty_points (user_id, points, tier)
    VALUES (new.id, 0, 'bronze')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
  END;
  $$;