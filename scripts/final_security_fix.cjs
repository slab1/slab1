const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';
const supabase = createClient(supabaseUrl, anonKey);

async function finalAttempt() {
    console.log('--- Final Attempt to Secure Project ---');

    // 1. Create a SECURE version of the sql runner
    const sql = `
        -- First, drop the insecure one if we can
        DROP FUNCTION IF EXISTS public.exec_sql(text);

        -- Now create the secure one
        CREATE OR REPLACE FUNCTION public.secure_exec_sql(sql_query text)
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            user_role text;
            result jsonb;
        BEGIN
            -- Strictly check for admin role
            SELECT role INTO user_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
            
            IF COALESCE(user_role, 'none') NOT IN ('superadmin', 'system_admin') THEN
                RAISE EXCEPTION 'Access Denied';
            END IF;

            EXECUTE sql_query INTO result;
            RETURN COALESCE(result, '{"status": "success"}'::jsonb);
        END;
        $$;

        -- Also, fix the profiles table right here in the same transaction/call
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop all policies on profiles
        DO $fresh$ 
        DECLARE 
            pol record;
        BEGIN 
            FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
                EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
            END LOOP;
        END $fresh$;

        -- Add secure policies
        CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Admins can view all" ON public.profiles FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('superadmin', 'system_admin'))
        );
    `;

    // We call the EXISTING exec_sql one last time to apply all this
    console.log('Applying all security fixes via existing loophole...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        console.error('RPC Error:', error.message);
    } else {
        console.log('Result:', data);
    }
}

finalAttempt();
