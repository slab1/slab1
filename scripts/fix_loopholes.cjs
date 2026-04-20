const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3NDE1NSwiZXhwIjoyMDU3NjUwMTU1fQ.3YQzB5P2Qv7t7y8x9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixLoopholes() {
    console.log('--- Fixing Critical Loopholes (Admin Mode) ---');

    // 1. Secure exec_sql function
    // We restrict it to ONLY be callable by superadmins OR service_role
    const secureSql = `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            user_role text;
            result jsonb;
        BEGIN
            -- 1. If it's the service_role (like this script), allow it.
            IF current_setting('role') = 'service_role' THEN
                EXECUTE sql_query INTO result;
                RETURN COALESCE(result, '{"status": "success", "message": "Command executed successfully"}'::jsonb);
            END IF;

            -- 2. If it's a user session, check if they are a superadmin
            SELECT role INTO user_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
            
            IF user_role IS NULL OR (user_role != 'superadmin' AND user_role != 'system_admin') THEN
                RAISE EXCEPTION 'Unauthorized: Only superadmins or service_role can execute arbitrary SQL. Current Role: %', user_role;
            END IF;

            EXECUTE sql_query INTO result;
            RETURN COALESCE(result, '{"status": "success", "message": "Command executed successfully"}'::jsonb);
        EXCEPTION WHEN OTHERS THEN
            RETURN jsonb_build_object('error', SQLERRM);
        END;
        $$;
    `;

    // 2. Secure profiles table - FORCE RLS AND CLEANUP
    const secureProfiles = `
        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Drop ALL existing policies to start fresh
        DO $$ 
        DECLARE 
            pol record;
        BEGIN 
            FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
                EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
            END LOOP;
        END $$;

        -- Policy: Users can view own profile
        CREATE POLICY "Users can view own profile" 
        ON public.profiles FOR SELECT 
        USING (auth.uid() = id);

        -- Policy: Admins can view all profiles
        CREATE POLICY "Admins can view all profiles" 
        ON public.profiles FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('superadmin', 'system_admin')
            )
        );

        -- Policy: Users can update their own profile
        CREATE POLICY "Users can update own profile" 
        ON public.profiles FOR UPDATE 
        USING (auth.uid() = id);

        -- Policy: System can manage all profiles
        CREATE POLICY "Service role can manage all profiles"
        ON public.profiles FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    `;

    console.log('Applying security patches...');
    
    // We use the service role key to execute these via the RPC
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: secureSql });
    if (sqlError) console.error('Error securing exec_sql:', sqlError.message);
    else console.log('✅ exec_sql secured with role checks.');

    const { error: profileError } = await supabase.rpc('exec_sql', { sql_query: secureProfiles });
    if (profileError) console.error('Error securing profiles:', profileError.message);
    else console.log('✅ profiles table security hardened.');
}

fixLoopholes();
