const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFunctions() {
    console.log('Fixing database functions with customer_id references...');
    
    const fixSql = `
        -- 1. Fix can_view_all_reservations
        CREATE OR REPLACE FUNCTION public.can_view_all_reservations()
        RETURNS boolean AS $$
        DECLARE
            r text;
        BEGIN
            SELECT role INTO r FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
            RETURN r IN ('restaurant_staff', 'restaurant_manager', 'restaurant_owner', 'system_admin', 'superadmin');
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- 2. Fix is_staff
        CREATE OR REPLACE FUNCTION public.is_staff()
        RETURNS boolean AS $$
        DECLARE
            current_role text;
        BEGIN
            SELECT role INTO current_role
            FROM public.user_roles
            WHERE user_id = auth.uid()
            LIMIT 1;

            RETURN current_role IN ('restaurant_staff', 'restaurant_manager', 'restaurant_owner', 'system_admin', 'superadmin');
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- 3. Fix check_can_manage_user_roles
        CREATE OR REPLACE FUNCTION public.check_can_manage_user_roles(caller_uuid uuid, target_profile_uuid uuid, check_type text)
        RETURNS boolean AS $$
        declare
          target_restaurant uuid;
          has_role boolean;
        begin
          -- resolve the restaurant_id of the target profile (via restaurant_staff). NULL if not staff.
          select rs.restaurant_id
            into target_restaurant
          from public.restaurant_staff rs
          where rs.profile_id = target_profile_uuid
          limit 1;

          if check_type = 'owner_manager_manage_staff' then
            -- caller must be restaurant_owner or restaurant_manager for the target_restaurant
            if target_restaurant is null then
              return false;
            end if;

            select exists(
              select 1
              from public.restaurant_staff rs2
              join public.user_roles ur2 on ur2.user_id = rs2.profile_id
              join public.roles r2 on r2.id = ur2.role_id
              where rs2.restaurant_id = target_restaurant
                and ur2.user_id = caller_uuid
                and r2.role = any(array['restaurant_owner','restaurant_manager'])
              limit 1
            ) into has_role;

            return coalesce(has_role, false);

          elsif check_type = 'systemadmin' then
            select exists(
              select 1
              from public.user_roles ur3
              join public.roles r3 on r3.id = ur3.role_id
              where ur3.user_id = caller_uuid
                and r3.role = 'systemadmin'
              limit 1
            ) into has_role;
            return coalesce(has_role, false);

          elsif check_type = 'superadmin' then
            select exists(
              select 1
              from public.user_roles ur4
              join public.roles r4 on r4.id = ur4.role_id
              where ur4.user_id = caller_uuid
                and r4.role = 'superadmin'
              limit 1
            ) into has_role;
            return coalesce(has_role, false);

          else
            return false;
          end if;
        end;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- 4. Fix handle_booking_confirmation
        CREATE OR REPLACE FUNCTION public.handle_booking_confirmation()
        RETURNS trigger AS $$
        DECLARE
            restaurant_auto_confirm boolean;
            auto_confirm_limit integer;
        BEGIN
            -- Get restaurant settings
            SELECT r.auto_confirm_bookings, r.auto_confirm_limit
            INTO restaurant_auto_confirm, auto_confirm_limit
            FROM public.restaurants r
            WHERE r.id = NEW.restaurant_id;

            -- Auto confirm if enabled and party size is within limit
            IF COALESCE(restaurant_auto_confirm, false) AND (auto_confirm_limit IS NULL OR COALESCE(NEW.guest_count, NEW.party_size, 0) <= auto_confirm_limit) THEN
                NEW.status = 'confirmed';
                
                -- Insert into notifications if the notifications table exists
                IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications') THEN
                    INSERT INTO public.notifications (user_id, type, title, message, data)
                    VALUES (
                        NEW.user_id,
                        'booking_confirmation',
                        'Booking Confirmed',
                        'Your booking has been automatically confirmed',
                        jsonb_build_object(
                            'booking_id', NEW.id,
                            'restaurant_id', NEW.restaurant_id,
                            'reservation_date', NEW.reservation_date,
                            'reservation_time', NEW.reservation_time
                        )
                    );
                END IF;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: fixSql });
    if (error) {
        console.error('Error fixing functions:', error.message);
    } else {
        console.log('Successfully fixed database functions!');
    }
}

fixFunctions();
