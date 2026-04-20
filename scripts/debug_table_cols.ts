
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_available_tables_enhanced', {
    p_location_id: '00000000-0000-0000-0000-000000000000', // dummy
    p_reservation_date: '2026-01-24',
    p_reservation_time: '12:00:00',
    p_party_size: 2,
    p_duration_minutes: 90
  });

  if (error) {
    console.log('RPC Error:', error.message);
    console.log('Error Code:', error.code);
    console.log('Error Details:', error.details);
    console.log('Error Hint:', error.hint);
  } else {
    console.log('RPC Success (unexpected if column missing)');
  }

  // Try to query table_combinations directly to see what columns we can see
  const { data: tcData, error: tcError } = await supabase
    .from('table_combinations')
    .select('*')
    .limit(1);

  if (tcError) {
    console.log('Table Combinations Error:', tcError.message);
  } else if (tcData && tcData.length > 0) {
    console.log('Table Combinations Columns:', Object.keys(tcData[0]));
  } else {
    console.log('Table Combinations is empty, trying to get column names from information_schema via RPC if possible');
  }
}

checkColumns();
