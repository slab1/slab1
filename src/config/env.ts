
/**
 * Environment configuration
 * Provides type-safe access to environment variables
 */

// Environment variables with fallbacks
export const env = {
  // API credentials and endpoints
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://reewcfpjlnufktvahtii.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXdjZnBqbG51Zmt0dmFodGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQxNTUsImV4cCI6MjA1NzY1MDE1NX0.nr7hXeKEvsVSi0qvQjb1_0SZz8Lx0JyHRbwTdcrVCcY',
  
  // App configuration
  appName: import.meta.env.VITE_APP_NAME || 'Reservatoo',
  defaultReservationDeposit: Number(import.meta.env.VITE_DEFAULT_RESERVATION_DEPOSIT || 10),
  maxPartySize: Number(import.meta.env.VITE_MAX_PARTY_SIZE || 20),
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
};

// Validation function to ensure required env vars are set
export function validateEnv(): boolean {
  const requiredVars = [
    'supabaseUrl',
    'supabaseAnonKey',
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const value = env[varName as keyof typeof env];
    return !value || typeof value === 'string' && value.includes('placeholder');
  });
  
  if (missingVars.length > 0) {
    console.error(`Missing or invalid environment variables: ${missingVars.join(', ')}`);
    console.error('Please set these environment variables in your deployment configuration.');
    console.error('For development, create a .env file in the project root with the variables from .env.example');
    return false;
  }
  
  return true;
}

// Check environment variables and provide appropriate feedback
const envValidation = validateEnv();
if (envValidation) {
  console.log('✅ Environment configuration loaded successfully');
} else {
  // Only warn in development to prevent breaking the app
  if (import.meta.env.PROD) {
    console.error('⚠️ Production environment has configuration issues');
    console.error('Using fallback Supabase configuration - some features may not work correctly');
  } else {
    console.warn('⚠️ Development environment using fallback configuration');
    console.warn('For optimal development experience, copy .env.example to .env');
  }
}
