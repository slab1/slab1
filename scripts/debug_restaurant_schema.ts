
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkRestaurantSchema() {
  console.log('Checking restaurants columns...');
  const { data: rData, error: rError } = await supabase
    .from('restaurants')
    .select('*')
    .limit(1);

  if (rError) {
    console.error('Error fetching restaurants:', rError.message);
  } else if (rData && rData.length > 0) {
    console.log('Restaurants Columns:', Object.keys(rData[0]));
  } else {
    console.log('Restaurants table is empty.');
  }

  console.log('\nChecking restaurant_settings columns...');
  const { data: rsData, error: rsError } = await supabase
    .from('restaurant_settings')
    .select('*')
    .limit(1);

  if (rsError) {
    console.error('Error fetching restaurant_settings:', rsError.message);
  } else if (rsData && rsData.length > 0) {
    console.log('Restaurant Settings Columns:', Object.keys(rsData[0]));
  } else {
    console.log('Restaurant Settings table is empty.');
  }
}

checkRestaurantSchema();
