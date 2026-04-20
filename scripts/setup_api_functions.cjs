const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupApiKeyFunctions() {
    console.log('Setting up API key generation functions...');
    
    const sql = `
        -- Ensure pgcrypto is enabled
        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        -- Function to generate a secure random string for the API key
        CREATE OR REPLACE FUNCTION public.generate_random_key(length int DEFAULT 32)
        RETURNS text AS $$
        DECLARE
          chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          result text := '';
          i int;
        BEGIN
          FOR i IN 1..length LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
          END LOOP;
          RETURN result;
        END;
        $$ LANGUAGE plpgsql VOLATILE;

        -- Function for users to create a new API key
        CREATE OR REPLACE FUNCTION public.create_api_key(key_name text)
        RETURNS TABLE (
          id uuid,
          prefix text,
          secret text
        ) AS $$
        DECLARE
          new_key text;
          new_prefix text;
          new_id uuid;
        BEGIN
          -- Generate a new key (prefix_secret)
          new_prefix := 'rt_';
          new_key := generate_random_key(32);
          
          -- Insert into api_keys table
          INSERT INTO public.api_keys (
            user_id,
            name,
            key_prefix,
            key_hash,
            is_active
          ) VALUES (
            auth.uid(),
            key_name,
            new_prefix,
            encode(digest(new_prefix || new_key, 'sha256'), 'hex'),
            true
          ) RETURNING public.api_keys.id INTO new_id;

          RETURN QUERY SELECT new_id, new_prefix, new_key;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
        console.error('Error setting up functions:', error.message);
    } else {
        console.log('Successfully set up API key functions!');
    }
}

setupApiKeyFunctions();
