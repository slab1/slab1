const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addUsageTracking() {
    console.log('Adding usage tracking columns to api_keys...');
    
    const sql = `
        ALTER TABLE public.api_keys 
        ADD COLUMN IF NOT EXISTS request_count bigint DEFAULT 0,
        ADD COLUMN IF NOT EXISTS monthly_quota bigint DEFAULT 1000;

        -- Create a table for daily usage tracking
        CREATE TABLE IF NOT EXISTS public.api_usage_logs (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            api_key_id uuid REFERENCES public.api_keys(id) ON DELETE CASCADE,
            endpoint text NOT NULL,
            method text NOT NULL,
            status_code int NOT NULL,
            user_id uuid,
            created_at timestamp with time zone DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

        -- Index for fast lookups
        CREATE INDEX IF NOT EXISTS idx_api_usage_logs_key_id ON public.api_usage_logs(api_key_id);
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
        console.error('Error adding usage tracking:', error.message);
    } else {
        console.log('Successfully added usage tracking!');
    }
}

addUsageTracking();
