-- 1. Drop and recreate restaurants RLS policies
DROP POLICY IF EXISTS "restaurants_admin_manage" ON public.restaurants;
DROP POLICY IF EXISTS "Owners can manage their own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "View restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Update restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public can view restaurants" ON public.restaurants;

CREATE POLICY "restaurants_admin_manage" ON public.restaurants
  FOR ALL TO authenticated
  USING (admin_id = auth.uid() OR owner_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (admin_id = auth.uid() OR owner_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "View restaurants" ON public.restaurants
  FOR SELECT TO authenticated
  USING (admin_id = auth.uid() OR owner_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "Public can view restaurants" ON public.restaurants
  FOR SELECT TO anon
  USING (true);

-- 2. Update is_restaurant_owner function
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(_user_id uuid, _restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE id = _restaurant_id
      AND (admin_id = _user_id OR owner_id = _user_id)
  );
$$;

-- 3. Update notify_restaurant_owner
CREATE OR REPLACE FUNCTION public.notify_restaurant_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_owner_id uuid;
  v_restaurant_name text;
BEGIN
  SELECT COALESCE(r.admin_id, r.owner_id), r.name
  INTO v_owner_id, v_restaurant_name
  FROM public.restaurants r
  JOIN public.restaurant_locations rl ON rl.restaurant_id = r.id
  WHERE rl.id = NEW.restaurant_location_id;

  IF v_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_owner_id,
      'New Reservation',
      'New reservation at ' || COALESCE(v_restaurant_name, 'your restaurant'),
      'new_booking'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Sync trigger for admin_id <-> owner_id
CREATE OR REPLACE FUNCTION public.sync_restaurant_owner_ids()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.admin_id IS NOT NULL AND NEW.owner_id IS NULL THEN
    NEW.owner_id := NEW.admin_id;
  ELSIF NEW.owner_id IS NOT NULL AND NEW.admin_id IS NULL THEN
    NEW.admin_id := NEW.owner_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_restaurant_owner_ids_trigger ON public.restaurants;
CREATE TRIGGER sync_restaurant_owner_ids_trigger
  BEFORE INSERT OR UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_restaurant_owner_ids();

-- 5. Sync existing data
UPDATE public.restaurants SET owner_id = admin_id WHERE admin_id IS NOT NULL AND owner_id IS NULL;
UPDATE public.restaurants SET admin_id = owner_id WHERE owner_id IS NOT NULL AND admin_id IS NULL;