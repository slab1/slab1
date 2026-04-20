
-- Fix 1: Remove overly permissive ingredients SELECT policy
DROP POLICY IF EXISTS "ingredients_select_authenticated" ON ingredients;

-- Fix 2: Fix special_events UPDATE policy to prevent admin self-escalation
DROP POLICY IF EXISTS "Users can update their own special event requests" ON special_events;

CREATE POLICY "Users can update their own special event requests"
ON special_events
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  (auth.uid() = user_id AND user_is_admin = false)
  OR is_admin()
);

-- Fix 3: Restrict marketing_subscribers INSERT to own email or restaurant owner
DROP POLICY IF EXISTS "Authenticated users can subscribe to marketing" ON marketing_subscribers;

CREATE POLICY "Authenticated users can subscribe to own email"
ON marketing_subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  -- User can subscribe themselves (email matches their auth email)
  (email = (SELECT auth.email()))
  -- Or restaurant owner can add subscribers
  OR EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = marketing_subscribers.restaurant_id
    AND r.owner_id = auth.uid()
  )
  -- Or admin
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('superadmin', 'system_admin')
  )
);
