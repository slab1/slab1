const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testExecSql() {
  console.log('Testing exec_sql with Anon Key...');
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1 as test' });
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! Data:', data);
  }
}

testExecSql();
