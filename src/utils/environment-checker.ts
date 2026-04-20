
import { env, validateEnv } from '@/config/env';

export function checkProductionReadiness(): { 
  isReady: boolean; 
  warnings: string[]; 
  errors: string[]; 
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for required environment variables
  if (!validateEnv()) {
    errors.push('Missing required environment variables');
  }

  // Check for development URLs in production (only if URLs are defined)
  if (env.supabaseUrl && (env.supabaseUrl.includes('localhost') || env.supabaseUrl.includes('127.0.0.1'))) {
    warnings.push('Using localhost Supabase URL - not suitable for production');
  }

  if (env.appUrl && (env.appUrl.includes('localhost') || env.appUrl.includes('127.0.0.1'))) {
    warnings.push('Using localhost app URL - update for production deployment');
  }

  // Check for default values that should be customized
  if (env.appName === 'Reservatoo') {
    warnings.push('Using default app name - consider customizing');
  }

  return {
    isReady: errors.length === 0,
    warnings,
    errors
  };
}

export function logEnvironmentStatus(): void {
  const status = checkProductionReadiness();
  
  if (status.errors.length > 0) {
    console.error('❌ Environment errors that must be fixed:');
    status.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (status.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    status.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (status.isReady && status.warnings.length === 0) {
    console.log('✅ Environment configuration looks good for production');
  }
}
