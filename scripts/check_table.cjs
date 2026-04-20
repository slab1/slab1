const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3NDE1NSwiZXhwIjoyMDU3NjUwMTU1fQ.3YQzB5P2Qv7t7y8x9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
    console.log('Checking user_roles table structure...');
    
    // Try to get one row or just the columns
    const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);
        
    if (error) {
        console.error('Error fetching user_roles:', error.message);
    } else {
        console.log('Successfully fetched user_roles:', data);
    }
}

checkTableStructure();
