const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sql = `
DO $$ 
BEGIN
    -- 1. Remove redundant/ambiguous foreign keys for menu_items -> menu_categories
    
    -- Drop fk_menu_items_category_id_ref_menu_categories if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_menu_items_category_id_ref_menu_categories') THEN
        ALTER TABLE public.menu_items DROP CONSTRAINT fk_menu_items_category_id_ref_menu_categories;
    END IF;

    -- Drop menu_items_category_id_fkey if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'menu_items_category_id_fkey') THEN
        ALTER TABLE public.menu_items DROP CONSTRAINT menu_items_category_id_fkey;
    END IF;

    -- Drop fk_menu_items_category if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_menu_items_category') THEN
        ALTER TABLE public.menu_items DROP CONSTRAINT fk_menu_items_category;
    END IF;

    -- 2. Re-create a single, clean foreign key constraint
    ALTER TABLE public.menu_items 
    ADD CONSTRAINT fk_menu_items_category 
    FOREIGN KEY (category_id) 
    REFERENCES public.menu_categories(id) 
    ON DELETE SET NULL;

    -- 3. Also check for menu_items -> restaurants just in case
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_menu_items_restaurant_id_ref_restaurants') THEN
        ALTER TABLE public.menu_items DROP CONSTRAINT fk_menu_items_restaurant_id_ref_restaurants;
    END IF;
    
    -- Ensure fk_menu_items_restaurant exists and is the only one
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_menu_items_restaurant') THEN
        ALTER TABLE public.menu_items 
        ADD CONSTRAINT fk_menu_items_restaurant 
        FOREIGN KEY (restaurant_id) 
        REFERENCES public.restaurants(id) 
        ON DELETE CASCADE;
    END IF;

END $$;
`;

async function applyMigration() {
  console.log('Applying migration to fix ambiguous foreign keys...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }
    
    console.log('Migration applied successfully:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

applyMigration();
