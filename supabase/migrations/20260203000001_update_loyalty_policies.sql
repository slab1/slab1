-- Update loyalty_programs policy to allow system admins to manage them
DROP POLICY IF EXISTS "Owners can manage loyalty programs" ON public.loyalty_programs;
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

-- Ensure system admins can manage loyalty rewards (already seems to be the case but making it explicit)
DROP POLICY IF EXISTS "Admins can manage loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Admins can manage loyalty rewards" ON public.loyalty_rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('superadmin', 'system_admin')
        )
    );
