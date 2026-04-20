const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sql = `-- Add staff_id to reservations and improve restaurant_staff
DO $$ 
BEGIN
    -- 1. Add staff_id to reservations
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'staff_id'
    ) THEN
        ALTER TABLE public.reservations ADD COLUMN staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 2. Add status to restaurant_staff if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_staff' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.restaurant_staff ADD COLUMN status TEXT DEFAULT 'active';
        -- Set initial status based on is_active
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_staff' AND column_name = 'is_active') THEN
            UPDATE public.restaurant_staff SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END;
        END IF;
    END IF;

    -- 3. Create helper function for staff restaurant ID
    EXECUTE 'CREATE OR REPLACE FUNCTION public.get_staff_restaurant_id(p_user_id UUID)
    RETURNS UUID AS $func$
        SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = p_user_id AND status = ''active'' LIMIT 1;
    $func$ LANGUAGE sql SECURITY DEFINER SET search_path = public';

    -- 4. Update reservations policy
    DROP POLICY IF EXISTS "Staff can manage assigned reservations" ON public.reservations;
    CREATE POLICY "Staff can manage assigned reservations"
    ON public.reservations
    FOR ALL
    TO authenticated
    USING (
        staff_id = auth.uid() OR
        restaurant_id = get_staff_restaurant_id(auth.uid())
    )
    WITH CHECK (
        staff_id = auth.uid() OR
        restaurant_id = get_staff_restaurant_id(auth.uid())
    );

    -- 5. Owners can also manage staff (ensure this is up to date)
    DROP POLICY IF EXISTS "Owners can manage their staff" ON public.restaurant_staff;
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

END $$;`;

async function applyMigration() {
  console.log('Applying migration to add staff_id to reservations...');
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
