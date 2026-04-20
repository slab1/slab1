const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envFile = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
    const match = envFile.match(new RegExp(`${name}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkApiFunctions() {
    console.log('Checking database structure...');
    
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', { 
        sql_query: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('api_keys', 'api_usage_logs');
        `
    });

    if (tablesError) {
        console.error('Error checking tables:', tablesError);
    } else {
        console.log('Tables found:', tables);
    }

    console.log('Checking API functions...');
    const { data: fns, error: fnsError } = await supabase.rpc('exec_sql', { 
        sql_query: `
            SELECT 
                p.proname as name
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname IN ('create_api_key', 'generate_random_key');
        `
    });

    if (fnsError) {
        console.error('Error fetching functions:', fnsError);
    } else {
        console.log('Functions found:', fns);
    }
}

checkApiFunctions();
