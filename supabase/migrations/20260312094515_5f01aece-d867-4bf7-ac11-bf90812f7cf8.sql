DROP TRIGGER IF EXISTS ensure_user_role ON auth.users;
DROP FUNCTION IF EXISTS public.enforce_user_role();