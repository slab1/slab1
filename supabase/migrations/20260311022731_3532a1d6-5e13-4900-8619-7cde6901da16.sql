-- 1. Fix handle_new_user trigger: loyalty_points uses user_id, not customer_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert/update into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', COALESCE(NEW.raw_user_meta_data->>'full_name', '')),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    updated_at = now();

  -- Assign default 'customer' role if no role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize loyalty points for new users (fixed: user_id, not customer_id)
  INSERT INTO public.loyalty_points (user_id, points, tier)
  VALUES (NEW.id, 0, 'Bronze')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2. Drop duplicate FK on reservations (fk_reservations_restaurant_id is duplicate of fk_reservations_restaurant)
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS fk_reservations_restaurant_id;

-- 3. Clean up redundant unique constraints on user_roles
-- Keep: user_roles_pkey, unique_customer_role(user_id, role), user_roles_user_id_role_id_restaurant_id_key
-- Drop duplicates:
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_customer_id_key;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_customer_role_key;