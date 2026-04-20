-- Update audit_logs policy to allow system admins to view them
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (
    get_user_role(auth.uid()) = ANY (ARRAY['admin', 'superadmin', 'system_admin'])
);

-- Also ensure system admins can view all loyalty programs (re-affirming)
DROP POLICY IF EXISTS "Owners and admins can manage loyalty programs" ON public.loyalty_programs;
CREATE POLICY "Owners and admins can manage loyalty programs" ON public.loyalty_programs
    FOR ALL USING (
        (public.is_owner() AND 
        restaurant_id IN (
            SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        )) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('superadmin', 'system_admin')
        )
    );
