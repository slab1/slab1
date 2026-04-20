
import { toast } from 'sonner';

export interface AppError {
  message: string;
  code?: string;
  context?: Record<string, any>;
  originalError?: Error;
}

export class ErrorHandler {
  static handle(error: unknown, context?: Record<string, any>): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      appError = {
        message: error.message,
        context,
        originalError: error,
      };
    } else if (typeof error === 'string') {
      appError = {
        message: error,
        context,
      };
    } else {
      appError = {
        message: 'An unknown error occurred',
        context: { ...context, originalError: error },
      };
    }

    // Log error for debugging
    console.error('Error handled:', appError);

    // Show user-friendly message
    this.showUserError(appError);

    return appError;
  }

  private static showUserError(error: AppError): void {
    // Don't show toast for authentication errors in production
    if (error.message.includes('auth') && process.env.NODE_ENV === 'production') {
      return;
    }

    // Show appropriate error message
    if (error.message.includes('Network')) {
      toast.error('Network error. Please check your connection.');
    } else if (error.message.includes('403') || error.message.includes('unauthorized')) {
      toast.error('You don\'t have permission to perform this action.');
    } else if (error.message.includes('404')) {
      toast.error('The requested resource was not found.');
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }
}

// Utility function for common async operations
export const safeAsync = ErrorHandler.withErrorHandling;
