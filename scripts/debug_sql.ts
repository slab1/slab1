
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSql(sql: string) {
  console.log('Running SQL...');
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('SQL Error:', error.message);
    console.error('Details:', error.details);
  } else {
    console.log('SQL Result:', JSON.stringify(data, null, 2));
  }
}

const arg = process.argv[2];
if (arg) {
  if (fs.existsSync(arg)) {
    const sql = fs.readFileSync(arg, 'utf8');
    runSql(sql);
  } else {
    runSql(process.argv.slice(2).join(' '));
  }
} else {
  console.log('Please provide SQL or a SQL file path as an argument.');
}
