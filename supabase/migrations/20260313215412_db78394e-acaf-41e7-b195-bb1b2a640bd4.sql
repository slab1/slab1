CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Initialize loyalty points
  INSERT INTO public.loyalty_points (user_id, points, tier)
  VALUES (new.id, 0, 'bronze')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;