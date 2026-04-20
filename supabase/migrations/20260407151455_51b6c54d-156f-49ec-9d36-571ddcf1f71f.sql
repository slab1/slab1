-- 2. Remove waitlist from Realtime publication (safe: do nothing if not present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'waitlist'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE waitlist;
  END IF;
END $$;

-- 3. Drop broken regional_compliance_select policy (NULL comparison)
DROP POLICY IF EXISTS "regional_compliance_select" ON regional_compliance;

-- 4. Replace JWT-based admin checks with is_admin() on 8 tables

-- api_usage_logs
DROP POLICY IF EXISTS "admin_select_api_usage_logs" ON api_usage_logs;
DROP POLICY IF EXISTS "tenant_select_api_usage_logs" ON api_usage_logs;
CREATE POLICY "admin_select_api_usage_logs"
ON api_usage_logs FOR SELECT TO authenticated
USING (user_id = auth.uid() OR is_admin());

-- system_settings
DROP POLICY IF EXISTS "admin_all_system_settings" ON system_settings;
DROP POLICY IF EXISTS "tenant_select_system_settings" ON system_settings;
CREATE POLICY "admin_all_system_settings"
ON system_settings FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- waitlist_audit
DROP POLICY IF EXISTS "admin_select_waitlist_audit" ON waitlist_audit;
DROP POLICY IF EXISTS "tenant_select_waitlist_audit" ON waitlist_audit;
CREATE POLICY "admin_select_waitlist_audit"
ON waitlist_audit FOR SELECT TO authenticated
USING (is_admin());

-- regional_audit_log
DROP POLICY IF EXISTS "admin_select_regional_audit_log" ON regional_audit_log;
DROP POLICY IF EXISTS "tenant_select_regional_audit_log" ON regional_audit_log;
CREATE POLICY "admin_select_regional_audit_log"
ON regional_audit_log FOR SELECT TO authenticated
USING (is_admin());

-- regional_plan_pricing
DROP POLICY IF EXISTS "admin_all_regional_plan_pricing" ON regional_plan_pricing;
DROP POLICY IF EXISTS "tenant_select_regional_plan_pricing" ON regional_plan_pricing;
CREATE POLICY "admin_all_regional_plan_pricing"
ON regional_plan_pricing FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- regional_compliance
DROP POLICY IF EXISTS "admin_all_regional_compliance" ON regional_compliance;
DROP POLICY IF EXISTS "tenant_all_regional_compliance" ON regional_compliance;
CREATE POLICY "admin_all_regional_compliance"
ON regional_compliance FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- regional_payment_methods
DROP POLICY IF EXISTS "admin_all_regional_payment_methods" ON regional_payment_methods;
DROP POLICY IF EXISTS "tenant_select_regional_payment_methods" ON regional_payment_methods;
CREATE POLICY "admin_all_regional_payment_methods"
ON regional_payment_methods FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- regional_plan_features
DROP POLICY IF EXISTS "admin_all_regional_plan_features" ON regional_plan_features;
DROP POLICY IF EXISTS "tenant_select_regional_plan_features" ON regional_plan_features;
CREATE POLICY "admin_all_regional_plan_features"
ON regional_plan_features FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());