import { toast } from "sonner";
import { HandleApiErrorReturnType, ApiErrorResponse } from './types';
import { Json } from './types';
import { errorTracker } from "@/utils/error-tracking";

export const convertToJson = (input: unknown): Json => {
  try {
    if (typeof input === 'object' && input !== null) {
      return Object.keys(input).reduce((acc, key) => {
        acc[key] = convertToJson(input[key]);
        return acc;
      }, {} as { [key: string]: Json });
    }
    return input as Json;
  } catch (error) {
    return {} as Json // Return empty object on error
  }
};

// Enhanced error handling helper with detailed logging
export const handleApiError = (error: unknown, options: { customMessage?: string; showToast?: boolean; context?: string; additionalInfo?: any } = {}): ApiErrorResponse => {
  const { customMessage, showToast = true, context = 'API', additionalInfo = {} } = options;
  
  // Log to centralized error tracker
  errorTracker.trackError(
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error)),
    { context, ...additionalInfo, showToast: false }
  );
  
  let errorMessage = customMessage || "An error occurred while connecting to the server.";
  
  // Extract more specific error information
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      errorMessage = customMessage || error.message;
    } else if ('error' in error && typeof error.error === 'string') {
      errorMessage = customMessage || error.error;
    } else if ('error_description' in error && typeof error.error_description === 'string') {
      errorMessage = customMessage || error.error_description;
    } else if ('code' in error && error.code === '42501') {
      errorMessage = customMessage || "Permission denied. You do not have access to this resource.";
    }
  }
  
  if (showToast) {
    toast.error(errorMessage);
  }
  
  return { error: errorMessage };
};

/**
 * Type guard to check if an API response is an error object
 */
export const isApiError = (data: any): data is ApiErrorResponse => {
  return (
    data !== null &&
    typeof data === 'object' &&
    'error' in data &&
    typeof data.error === 'string'
  );
};
