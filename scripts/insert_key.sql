INSERT INTO public.api_keys (user_id, name, key_hash, key_prefix, monthly_quota, is_active)
SELECT admin_id, 'Manual Test Key', '689849208a0d09990597275005e8062957f12e09641753736735747474747474', 'rt_', 1000, true
FROM restaurants
LIMIT 1;