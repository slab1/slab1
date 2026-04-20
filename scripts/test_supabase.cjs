const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    try {
        const { data, error } = await supabase.from('profiles').select('id, email').limit(1);
        if (error) {
            console.error('Connection error:', error.message);
            if (error.message.includes('fetch failed')) {
                console.error('Network error: Is the Supabase project reachable?');
            }
        } else {
            console.log('Connection successful! Found profiles:', data.length);
        }
    } catch (e) {
        console.error('Unexpected error:', e.message);
    }
}

testConnection();
