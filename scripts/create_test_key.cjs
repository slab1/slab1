const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestKey() {
  console.log('Querying for existing API keys...');
  const { data: keys, error: kError } = await supabase
    .from('api_keys')
    .select('*');

  if (kError) {
    console.error('Error finding keys:', kError);
  } else {
    console.log('Found keys:', keys);
  }
}

createTestKey();