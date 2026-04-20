const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
// Using the service role key to inspect and fix RLS
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3NDE1NSwiZXhwIjoyMDU3NjUwMTU1fQ.3YQzB5P2Qv7t7y8x9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectPolicies() {
    console.log('--- Inspecting API Security Policies ---');
    
    const query = `
        SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
        FROM pg_policies 
        WHERE tablename IN ('api_keys', 'api_usage_logs');
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
        console.error('Error inspecting policies:', error.message);
    } else {
        console.log('Policies found:', JSON.stringify(data, null, 2));
    }
}

inspectPolicies();
