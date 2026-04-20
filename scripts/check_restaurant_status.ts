
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkStatusValues() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('status, is_active')
    .limit(100);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const statuses = [...new Set(data.map(r => r.status))];
  const actives = [...new Set(data.map(r => r.is_active))];

  console.log('Distinct Statuses:', statuses);
  console.log('Distinct IsActive:', actives);
  console.log('Sample data:', data.slice(0, 5));
}

checkStatusValues();
