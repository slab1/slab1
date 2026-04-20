import { createClient } from '@supabase/supabase-js';
import { ENV_SEED_DATA } from '../src/utils/seed-data';

// Fallback values from env.ts
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://reewcfpjlnufktvahtii.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSeed() {
  const env = process.argv[2] || 'development';
  const dryRun = process.argv.includes('--dry-run');
  const clear = process.argv.includes('--clear');

  console.log(`🚀 Starting CLI Seeder [Env: ${env}] [Dry Run: ${dryRun}] [Clear: ${clear}]`);

  const seedData = ENV_SEED_DATA[env];
  if (!seedData) {
    console.error(`❌ Error: Unknown environment '${env}'. Available: ${Object.keys(ENV_SEED_DATA).join(', ')}`);
    process.exit(1);
  }

  try {
    if (clear) {
      console.log('🧹 Clearing existing data...');
      // Logic for clearing (reverse order)
      const tablesToClear = ['chefs', 'stock_levels', 'ingredients', 'menu_items', 'menu_categories', 'tables', 'restaurant_locations', 'restaurants', 'user_roles'];
      for (const table of tablesToClear) {
        if (!dryRun) {
          const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) console.warn(`   Warning clearing ${table}: ${error.message}`);
          else console.log(`   ✅ Cleared ${table}`);
        } else {
          console.log(`   [DRY RUN] Would clear ${table}`);
        }
      }
    }

    const tableOrder = [
      { name: 'profiles', data: seedData.profiles },
      { name: 'user_roles', data: seedData.user_roles },
      { name: 'restaurants', data: seedData.restaurants },
      { name: 'restaurant_locations', data: seedData.locations },
      { name: 'tables', data: seedData.tables },
      { name: 'menu_categories', data: seedData.menuCategories },
      { name: 'menu_items', data: seedData.menuItems },
      { name: 'ingredients', data: seedData.ingredients },
      { name: 'stock_levels', data: seedData.stock_levels },
      { name: 'chefs', data: seedData.chefs }
    ];

    for (const { name, data } of tableOrder) {
      if (!data || data.length === 0) continue;

      if (dryRun) {
        console.log(`   [DRY RUN] Would upsert ${data.length} records into ${name}`);
      } else {
        const { error } = await supabase.from(name).upsert(data);
        if (error) {
          console.error(`   ❌ Error seeding ${name}: ${error.message}`);
        } else {
          console.log(`   ✅ Seeded ${data.length} records into ${name}`);
        }
      }
    }

    console.log('✨ Seeding process completed!');
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
