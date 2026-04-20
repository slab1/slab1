import { supabase } from "@/integrations/supabase/client";
import { errorTracker } from "./error-tracking";

interface ConnectionResult {
  isHealthy: boolean;
  latency: number;
  error?: string;
}

let cachedStatus: { result: ConnectionResult; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Tests the database connection with retry logic and caching
 */
export const testDatabaseConnection = async (force: boolean = false): Promise<boolean> => {
  const now = Date.now();
  
  if (!force && cachedStatus && (now - cachedStatus.timestamp < CACHE_DURATION)) {
    return cachedStatus.result.isHealthy;
  }

  const start = performance.now();
  let retryCount = 0;
  const maxRetries = 2;

  const performCheck = async (): Promise<ConnectionResult> => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .select('id', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        // If it's a "table not found" error, the connection is actually working
        if (error.code === 'PGRST116' || error.code === '42P01') {
          return { isHealthy: true, latency: performance.now() - start };
        }
        throw error;
      }

      return { isHealthy: true, latency: performance.now() - start };
    } catch (err: any) {
      return { 
        isHealthy: false, 
        latency: performance.now() - start,
        error: err.message || 'Unknown connection error'
      };
    }
  };

  let result = await performCheck();

  while (!result.isHealthy && retryCount < maxRetries) {
    retryCount++;
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 500));
    result = await performCheck();
  }

  if (!result.isHealthy) {
    errorTracker.captureError(new Error(`DB Connection Failed: ${result.error}`), 'warning', {
      retryCount,
      latency: result.latency
    });
  }

  cachedStatus = { result, timestamp: now };
  return result.isHealthy;
};

/**
 * Gets the current connection status details
 */
export const getConnectionStatus = async (): Promise<ConnectionResult> => {
  await testDatabaseConnection();
  return cachedStatus!.result;
};
