
-- Fix search_path on all remaining public functions
DO $$
DECLARE
  func_names text[] := ARRAY[
    'audit_booking_changes',
    'calculate_restaurant_rating',
    'check_can_manage_user_roles',
    'check_table_availability',
    'confirm_reservation_transactional',
    'create_api_key_legacy_v1',
    'create_order_and_consume_stock',
    'generate_random_key',
    'handle_booking_conflicts',
    'handle_updated_at',
    'is_owner_user',
    'manage_waitlist',
    'sync_reservation_user_ids',
    'update_notification_status',
    'update_reservation_timestamps',
    'update_updated_at_column',
    'validate_reservation_guest_count'
  ];
  func_record record;
BEGIN
  FOR func_record IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = ANY(func_names)
    AND (p.proconfig IS NULL OR NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'))
  LOOP
    EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', func_record.proname, func_record.args);
  END LOOP;
END $$;
