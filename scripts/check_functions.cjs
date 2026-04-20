const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Starting check...');
    const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'push_subscriptions'" 
    });
    console.log(JSON.stringify(data, null, 2));
}
check();
