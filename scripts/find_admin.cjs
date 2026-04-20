const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file explicitly
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
}

// Get env vars with fallbacks for debugging

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://reewcfpjlnufktvahtii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY';


console.log('--- SUPABASE CONFIG ---');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING');

if (supabaseKey) {
    try {
        const payload = JSON.parse(Buffer.from(supabaseKey.split('.')[1], 'base64').toString());
        console.log('Key Role:', payload.role);
        console.log('Key Project Ref:', payload.ref);
    } catch (e) {
        console.log('Could not decode key payload');
    }
}

if (!supabaseKey) {
    console.error('CRITICAL: No Supabase Key found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findSuperAdminAndDebug() {
    console.log('\n--- Searching for SuperAdmins ---');
    
    try {
        // 1. Check user_roles for superadmin
        const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*, profiles(email, first_name, last_name)')
            .eq('role', 'superadmin');

        if (rolesError) {
            console.error('Error fetching superadmin roles:', rolesError.message);
            
            // Try to list all roles to see what exists
            console.log('Attempting to fetch all roles as fallback...');
            const { data: allRoles, error: allErr } = await supabase.from('user_roles').select('role').limit(10);
            if (allErr) {
                console.error('Fallback fetch failed:', allErr.message);
            } else {
                console.log('Available roles in table:', allRoles.map(r => r.role));
            }
            return;
        }

        console.log(`Found ${roles.length} SuperAdmins:`);
        if (roles.length > 0) {
            console.table(roles.map(r => ({
                user_id: r.user_id,
                role: r.role,
                email: r.profiles?.email || 'N/A',
                name: `${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.trim() || 'N/A'
            })));

            const userId = roles[0].user_id;
            console.log(`\n--- Debugging Role Lookup for User: ${userId} ---`);
            
            // 2. Test the RPC function used by the frontend
            const { data: rpcRole, error: rpcError } = await supabase
                .rpc('get_user_highest_role', { _user_id: userId });
            
            if (rpcError) {
                console.error('RPC get_user_highest_role failed:', rpcError.message);
            } else {
                console.log('RPC get_user_highest_role result:', rpcRole);
            }

            // 3. Check direct table lookup
            const { data: directRole, error: directErr } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle();
            
            if (directErr) {
                console.error('Direct table lookup failed:', directErr.message);
            } else {
                console.log('Direct table lookup result:', directRole?.role);
            }
        } else {
            console.log('No users with "superadmin" role found.');
            
            // Check for other admin-like roles
            const { data: otherAdmins } = await supabase
                .from('user_roles')
                .select('role')
                .ilike('role', '%admin%');
            
            if (otherAdmins && otherAdmins.length > 0) {
                console.log('Found other admin roles:', [...new Set(otherAdmins.map(r => r.role))]);
            } else {
                // If no admin roles found, list what IS there
                const { data: someRoles } = await supabase.from('user_roles').select('role').limit(5);
                console.log('Example roles in table:', someRoles?.map(r => r.role) || 'None found');
            }
        }

        console.log('\n--- PROFILES ---');
        const { data: profiles, error: profError } = await supabase
            .from('profiles')
            .select('id, email');
        
        if (profError) {
            console.error('Error fetching profiles:', profError.message);
        } else {
            console.log(`Found ${profiles?.length || 0} profiles:`);
            console.table(profiles);
        }
    } catch (err) {
        console.error('Unexpected error during execution:', err.message);
    }
}

findSuperAdminAndDebug();
