
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkSchema() {
  console.log('Checking table_combinations schema...');
  const { data, error } = await supabase
    .from('table_combinations')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching table_combinations:', error.message);
    if (error.message.includes('column "name" does not exist')) {
        console.log('Confirmed: column "name" is missing.');
    }
  } else {
    console.log('Successfully fetched table_combinations.');
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    } else {
      console.log('Table is empty. Trying to get columns via RPC or information_schema if possible.');
      // Since we can't easily run arbitrary SQL via anon key, we'll try to insert a dummy row and see what happens, or just rely on the select *
    }
  }
}

checkSchema();
