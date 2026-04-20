const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findVulnerabilities() {
    console.log('--- Security Audit: Checking for tables without RLS ---');
    
    const checkRlsSql = `
        SELECT 
            relname as table_name,
            relrowsecurity as rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relkind = 'r'
        AND relrowsecurity = false;
    `;
    
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', { sql_query: checkRlsSql });
    if (rlsError) {
        console.error('Error checking RLS:', rlsError.message);
    } else {
        console.log('Tables without RLS enabled:', rlsData);
    }

    console.log('\n--- Security Audit: Checking for public profiles access ---');
    // Check if anyone can see other users' emails in profiles
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .limit(5);
    
    if (profileError) {
        console.log('Profiles table is protected (Good).');
    } else {
        console.log('WARNING: Profiles are readable by public/anon!', profileData.length, 'records found.');
    }

    console.log('\n--- Security Audit: Checking active policies on profiles ---');
    const { data: policyData, error: policyError } = await supabase.rpc('exec_sql', { 
        sql_query: "SELECT * FROM pg_policies WHERE tablename = 'profiles'" 
    });
    console.log('Active policies:', policyData);
}

findVulnerabilities();
