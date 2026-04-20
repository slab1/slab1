const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Anon Key (start):', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) : 'undefined');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to Supabase with Anon Key...');
  try {
    const { data, error } = await supabase.from('user_roles').select('user_id, role').eq('role', 'superadmin');
    if (error) {
      console.error('Error fetching superadmins:', error);
    } else {
      console.log('Superadmins found:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
