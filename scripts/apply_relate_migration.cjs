const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigration() {
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260201000002_relate_tables.sql');
  console.log(`Reading migration from ${migrationPath}...`);
  
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Applying migration to relate tables...');
    
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
