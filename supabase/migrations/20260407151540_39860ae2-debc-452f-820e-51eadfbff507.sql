-- Fix combination_table_members: drop old permissive policies, create scoped ones
DROP POLICY IF EXISTS "combination_table_members_select_authenticated_only" ON combination_table_members;
DROP POLICY IF EXISTS "combination_table_members_insert_authenticated_only" ON combination_table_members;
DROP POLICY IF EXISTS "combination_table_members_update_authenticated_only" ON combination_table_members;
DROP POLICY IF EXISTS "combination_table_members_delete_authenticated_only" ON combination_table_members;

CREATE POLICY "Restaurant staff can view combination members"
ON combination_table_members FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM table_combinations tc
    JOIN restaurants r ON r.id = tc.restaurant_id
    WHERE tc.id = combination_table_members.combination_id
    AND (r.owner_id = auth.uid() OR is_staff())
  )
  OR is_admin()
);

CREATE POLICY "Restaurant staff can insert combination members"
ON combination_table_members FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM table_combinations tc
    JOIN restaurants r ON r.id = tc.restaurant_id
    WHERE tc.id = combination_table_members.combination_id
    AND (r.owner_id = auth.uid() OR is_staff())
  )
  OR is_admin()
);

CREATE POLICY "Restaurant staff can update combination members"
ON combination_table_members FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM table_combinations tc
    JOIN restaurants r ON r.id = tc.restaurant_id
    WHERE tc.id = combination_table_members.combination_id
    AND (r.owner_id = auth.uid() OR is_staff())
  )
  OR is_admin()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM table_combinations tc
    JOIN restaurants r ON r.id = tc.restaurant_id
    WHERE tc.id = combination_table_members.combination_id
    AND (r.owner_id = auth.uid() OR is_staff())
  )
  OR is_admin()
);

CREATE POLICY "Restaurant staff can delete combination members"
ON combination_table_members FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM table_combinations tc
    JOIN restaurants r ON r.id = tc.restaurant_id
    WHERE tc.id = combination_table_members.combination_id
    AND (r.owner_id = auth.uid() OR is_staff())
  )
  OR is_admin()
);