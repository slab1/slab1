
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Try to get env vars from a .env file or fallback to known config
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    try {
        const envFile = fs.readFileSync('.env', 'utf8');
        const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
        const keyMatch = envFile.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)/);
        if (urlMatch) supabaseUrl = urlMatch[1].trim();
        if (keyMatch) supabaseKey = keyMatch[1].trim();
    } catch (e) {
        console.error('Could not read .env file');
    }
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunction() {
    console.log('Checking get_user_highest_role definition...');
    const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: `
            SELECT 
                p.proname as name,
                pg_get_functiondef(p.oid) as definition
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'get_user_highest_role';
        `
    });

    if (error) {
        console.error('Error fetching function definition:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Function Definition:');
        console.log(data[0].definition);
    } else {
        console.log('Function get_user_highest_role not found.');
    }
}

checkFunction();
