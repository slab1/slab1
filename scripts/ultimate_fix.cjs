const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';
const supabase = createClient(supabaseUrl, anonKey);

async function fix() {
    // We use a multi-statement query where the LAST statement returns JSONB
    // This satisfies the INTO result requirement of the existing exec_sql function.
    const sql = `
        -- 1. Enable RLS on profiles
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- 2. Drop all policies on profiles
        DO $$ 
        DECLARE 
            pol record;
        BEGIN 
            FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
                EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
            END LOOP;
        END $$;

        -- 3. Add secure policies
        CREATE POLICY "Users view own" ON public.profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Admins view all" ON public.profiles FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('superadmin', 'system_admin'))
        );

        -- 4. Recreate exec_sql to be SECURE
        CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $func$
        DECLARE
            user_role text;
            result jsonb;
        BEGIN
            -- Check for admin role
            SELECT role INTO user_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
            
            IF COALESCE(user_role, 'none') NOT IN ('superadmin', 'system_admin') THEN
                RAISE EXCEPTION 'Access Denied';
            END IF;

            EXECUTE sql_query INTO result;
            RETURN COALESCE(result, '{"status": "success"}'::jsonb);
        EXCEPTION WHEN OTHERS THEN
            RETURN jsonb_build_object('error', SQLERRM);
        END;
        $func$;

        -- 5. RETURN A VALID JSONB VALUE TO SATISFY THE WRAPPER
        SELECT '{"status": "all_patches_applied"}'::jsonb;
    `;

    console.log('Sending multi-patch SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) console.error('RPC Error:', error.message);
    else console.log('Result:', data);

    console.log('\nVerifying profile access...');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1);
    if (pError) console.log('✅ Profiles are now protected:', pError.message);
    else console.log('❌ Profiles are still readable!', profiles);

    console.log('\nVerifying exec_sql access...');
    const { data: execData, error: eError } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' });
    if (execData?.error && execData.error.includes('Access Denied')) {
        console.log('✅ exec_sql is now secured.');
    } else {
        console.log('❌ exec_sql is still insecure!', execData);
    }
}

fix();
