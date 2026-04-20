-- Fix 1: Recreate user_roles_with_customer as security invoker
DROP VIEW IF EXISTS public.user_roles_with_customer;
CREATE VIEW public.user_roles_with_customer
WITH (security_invoker = on) AS
SELECT ur.id,
    ur.user_id,
    ur.role,
    ur.restaurant_id,
    ur.assigned_by,
    ur.created_at,
    p.full_name,
    p.email,
    p.avatar_url
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.id;

-- Fix 2: Replace permissive events policy with role-restricted one
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;

CREATE POLICY "Admins and partners can manage events"
ON public.events
FOR ALL
TO authenticated
USING (public.has_role_group(auth.uid(), 'admin') OR public.has_role_group(auth.uid(), 'partner'))
WITH CHECK (public.has_role_group(auth.uid(), 'admin') OR public.has_role_group(auth.uid(), 'partner'));