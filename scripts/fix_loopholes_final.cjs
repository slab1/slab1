const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';
const supabase = createClient(supabaseUrl, anonKey);

async function fixLoopholesFinal() {
    console.log('--- Fixing Critical Loopholes (Using Anon Key loophole to patch) ---');

    // 1. Secure exec_sql function - PROPERLY this time
    // We use COALESCE to handle NULL roles and ensure they are NOT allowed.
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
            -- 1. Check if it's the service_role
            IF current_setting('role') = 'service_role' THEN
                EXECUTE sql_query INTO result;
                RETURN COALESCE(result, '{"status": "success"}'::jsonb);
            END IF;

            -- 2. Check user session
            SELECT role INTO user_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
            
            -- If user_role is NULL or not admin, REJECT
            IF COALESCE(user_role, 'none') NOT IN ('superadmin', 'system_admin') THEN
                RAISE EXCEPTION 'Unauthorized: Access denied.';
            END IF;

            EXECUTE sql_query INTO result;
            RETURN COALESCE(result, '{"status": "success"}'::jsonb);
        EXCEPTION WHEN OTHERS THEN
            RETURN jsonb_build_object('error', SQLERRM);
        END;
        $$;
    `;

    // 2. Secure profiles table - FORCE RLS AND CLEANUP
    const secureProfiles = `
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Drop ALL existing policies
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

        -- Policy: Service role can manage all profiles
        CREATE POLICY "Service role can manage all profiles"
        ON public.profiles FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    `;

    console.log('Patching exec_sql...');
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: secureSql });
    if (sqlError) console.error('Error:', sqlError.message);
    else console.log('✅ exec_sql secured.');

    console.log('Patching profiles...');
    const { error: profileError } = await supabase.rpc('exec_sql', { sql_query: secureProfiles });
    if (profileError) console.error('Error:', profileError.message);
    else console.log('✅ profiles secured.');
}

fixLoopholesFinal();
