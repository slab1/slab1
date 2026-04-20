const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file explicitly
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });


const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';

const supabase = createClient(supabaseUrl, supabaseKey);

const USERS_TO_PROMOTE = [
    { email: 'slablaykon@ieee.org', id: '27e3dcae-620e-448d-b7ed-7a6ef9dbfe92' },
    { email: 'slablaykon@gmail.com', id: '2c5ea04d-3cba-4e0a-8500-6e3e2c641034' },
    { email: 'bigwestern@gmail.com', id: '43dca161-a52f-4a19-856f-a9ab0b6523f2' }
];

async function promoteUsers() {
    console.log('Fixing database schema and functions...');
    
    const fixSql = `
        -- 1. Fix role_change_audit table
        DO $$ 
        BEGIN 
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_change_audit' AND column_name = 'customer_id') THEN
                ALTER TABLE public.role_change_audit RENAME COLUMN customer_id TO user_id;
            END IF;
        END $$;

        -- 2. Drop and recreate functions to avoid parameter name issues
        DROP FUNCTION IF EXISTS public.audit_role_changes() CASCADE;
        DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
        DROP FUNCTION IF EXISTS public.user_has_role(uuid, text) CASCADE;
        DROP FUNCTION IF EXISTS public.can_manage_role(text) CASCADE;

        -- 2. Recreate audit_role_changes function
        CREATE OR REPLACE FUNCTION public.audit_role_changes()
        RETURNS trigger AS $$
        BEGIN
          IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
            INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by, reason)
            VALUES (NEW.user_id, OLD.role, NEW.role, auth.uid(), 'Role updated via application');
          ELSIF TG_OP = 'INSERT' THEN
            INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by, reason)
            VALUES (NEW.user_id, NULL, NEW.role, auth.uid(), 'Initial role assignment');
          END IF;
          RETURN COALESCE(NEW, OLD);
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Re-attach trigger
        DROP TRIGGER IF EXISTS role_audit_trigger ON public.user_roles;
        CREATE TRIGGER role_audit_trigger
          AFTER INSERT OR UPDATE ON public.user_roles
          FOR EACH ROW
          EXECUTE FUNCTION public.audit_role_changes();

        -- 3. Recreate get_user_role function
        CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid DEFAULT auth.uid())
        RETURNS text AS $$
        BEGIN
          RETURN (SELECT role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1);
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- 4. Recreate user_has_role function
        CREATE OR REPLACE FUNCTION public.user_has_role(p_user_id uuid, p_required_role text)
        RETURNS boolean AS $$
        DECLARE
          v_user_role TEXT;
        BEGIN
          SELECT role INTO v_user_role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
          RETURN v_user_role = p_required_role OR
                 (v_user_role = 'superadmin') OR
                 (v_user_role = 'system_admin' AND p_required_role NOT IN ('superadmin')) OR
                 (v_user_role = 'restaurant_owner' AND p_required_role IN ('restaurant_manager', 'restaurant_staff', 'inventory_manager', 'customer')) OR
                 (v_user_role = 'restaurant_manager' AND p_required_role IN ('restaurant_staff', 'inventory_manager', 'customer')) OR
                 (v_user_role = 'restaurant_staff' AND p_required_role = 'customer');
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- 5. Recreate can_manage_role function
        CREATE OR REPLACE FUNCTION public.can_manage_role(p_target_role text)
        RETURNS boolean AS $$
        DECLARE
            v_current_user_role text;
        BEGIN
            SELECT role INTO v_current_user_role
            FROM public.user_roles
            WHERE user_id = auth.uid()
            LIMIT 1;

            IF v_current_user_role = 'superadmin' THEN
                RETURN true;
            ELSIF v_current_user_role IN ('system_admin', 'admin') AND p_target_role NOT IN ('superadmin', 'system_admin') THEN
                RETURN true;
            ELSIF v_current_user_role = 'restaurant_owner' AND p_target_role IN ('restaurant_manager', 'restaurant_staff', 'inventory_manager', 'customer') THEN
                RETURN true;
            ELSE
                RETURN false;
            END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: fixSql });
    if (error) {
        console.error('Error fixing schema/functions:', error.message);
        return;
    }
    console.log('Schema and functions fixed successfully!');

    // Now try to promote users
    console.log('Promoting users...');
    for (const user of USERS_TO_PROMOTE) {
        console.log(`Processing ${user.email} (${user.id})...`);
        const promoteSql = `
            INSERT INTO public.user_roles (user_id, role_id, role)
            VALUES ('${user.id}', 'superadmin', 'superadmin')
            ON CONFLICT (user_id) DO UPDATE SET role_id = 'superadmin', role = 'superadmin';
        `;
        const { error: pError } = await supabase.rpc('exec_sql', { sql_query: promoteSql });
        if (pError) {
            console.error(`Error promoting ${user.email}:`, pError.message);
        } else {
            console.log(`Successfully promoted ${user.email} to superadmin!`);
        }
    }
}

promoteUsers();
