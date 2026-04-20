-- 1. Drop overly permissive ingredients INSERT policy
DROP POLICY IF EXISTS "ingredients_insert_authenticated" ON ingredients;

-- 2. Fix table_status_history INSERT policy - scope to restaurant staff
DROP POLICY IF EXISTS "Authenticated users can insert table status" ON table_status_history;

CREATE POLICY "table_status_insert_restaurant_staff"
ON table_status_history
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tables t
    JOIN restaurant_locations rl ON rl.id = t.restaurant_location_id
    WHERE t.id = table_status_history.table_id
    AND (
      rl.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.restaurant_id = rl.restaurant_id
        AND ur.user_id = auth.uid()
        AND ur.role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner', 'restaurant_manager', 'restaurant_staff')
      )
    )
  )
);

-- 3. Fix loyalty_points - remove user INSERT/UPDATE, create SECURITY DEFINER function
DROP POLICY IF EXISTS "Users can insert their own loyalty points" ON loyalty_points;
DROP POLICY IF EXISTS "Users can update their own loyalty points" ON loyalty_points;

CREATE POLICY "loyalty_points_admin_insert"
ON loyalty_points
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('superadmin', 'system_admin', 'admin')
  )
);

CREATE POLICY "loyalty_points_admin_update"
ON loyalty_points
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('superadmin', 'system_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('superadmin', 'system_admin', 'admin')
  )
);

DROP POLICY IF EXISTS "Users can insert own transactions" ON loyalty_points_transactions;

CREATE POLICY "loyalty_transactions_admin_insert"
ON loyalty_points_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('superadmin', 'system_admin', 'admin')
  )
);

-- Create a SECURITY DEFINER function for awarding points
CREATE OR REPLACE FUNCTION public.award_loyalty_points(
  p_user_id uuid,
  p_points integer,
  p_description text DEFAULT NULL,
  p_restaurant_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'system_admin', 'admin', 'restaurant_owner', 'restaurant_manager')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  INSERT INTO loyalty_points (user_id, points, lifetime_points, tier)
  VALUES (p_user_id, p_points, p_points, 'bronze')
  ON CONFLICT (user_id) DO UPDATE
  SET points = loyalty_points.points + p_points,
      lifetime_points = loyalty_points.lifetime_points + p_points,
      updated_at = now();

  INSERT INTO loyalty_points_transactions (user_id, points, transaction_type, description, restaurant_id)
  VALUES (p_user_id, p_points, 'credit', COALESCE(p_description, 'Points awarded'), p_restaurant_id);
END;
$$;

-- 4. Restrict user_roles views
REVOKE SELECT ON user_roles_unified FROM anon, authenticated;
REVOKE SELECT ON user_roles_with_customer FROM anon, authenticated;

CREATE OR REPLACE VIEW user_roles_unified
WITH (security_invoker = on)
AS
SELECT ur.id, ur.user_id, ur.role, ur.role_id, ur.restaurant_id,
    ur.created_at, ur.updated_at,
    p.first_name, p.last_name, p.email, p.is_active, p.last_login
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id;

CREATE OR REPLACE VIEW user_roles_with_customer
WITH (security_invoker = on)
AS
SELECT ur.id, ur.user_id, ur.role, ur.restaurant_id, ur.assigned_by,
    ur.created_at, p.full_name, p.email, p.avatar_url
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.id;

GRANT SELECT ON user_roles_unified TO authenticated;
GRANT SELECT ON user_roles_with_customer TO authenticated;

-- 5. Remove duplicate usage_analytics policy if exists
DROP POLICY IF EXISTS "usage_analytics_select" ON usage_analytics;