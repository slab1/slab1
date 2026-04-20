const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sql = `-- Fix restaurant_staff relationship and RLS
DO $$ 
BEGIN
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'restaurant_staff_user_id_fkey'
    ) THEN
        ALTER TABLE public.restaurant_staff
        ADD CONSTRAINT restaurant_staff_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
    END IF;

    -- Enable RLS
    ALTER TABLE public.restaurant_staff ENABLE ROW LEVEL SECURITY;

    -- Create policies
    -- 1. Owners can manage their staff
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can manage their staff' AND tablename = 'restaurant_staff') THEN
        CREATE POLICY "Owners can manage their staff"
        ON public.restaurant_staff
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.restaurants
                WHERE id = restaurant_staff.restaurant_id
                AND admin_id = auth.uid()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.restaurants
                WHERE id = restaurant_staff.restaurant_id
                AND admin_id = auth.uid()
            )
        );
    END IF;

    -- 2. Staff can view their own record
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view their own record' AND tablename = 'restaurant_staff') THEN
        CREATE POLICY "Staff can view their own record"
        ON public.restaurant_staff
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
    END IF;

    -- 3. Superadmins can do everything
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Superadmins can manage all staff' AND tablename = 'restaurant_staff') THEN
        CREATE POLICY "Superadmins can manage all staff"
        ON public.restaurant_staff
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_id = auth.uid()
                AND role = 'superadmin'
            )
        );
    END IF;

END $$;`;

async function applyMigration() {
  console.log('Applying migration to fix restaurant_staff schema...');
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
