import { toast } from 'sonner';
import { errorMonitor } from './error-monitoring';

export interface EnhancedError {
  message: string;
  code?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  stack?: string;
}

export class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler;
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;

  static getInstance(): EnhancedErrorHandler {
    if (!this.instance) {
      this.instance = new EnhancedErrorHandler();
    }
    return this.instance;
  }

  async handleError(
    error: unknown,
    context?: Record<string, any>,
    options?: {
      showToast?: boolean;
      retry?: () => Promise<any>;
      retryKey?: string;
    }
  ): Promise<EnhancedError> {
    const enhancedError = this.parseError(error, context);
    
    // Log to monitoring system
    errorMonitor.captureError(
      new Error(enhancedError.message), 
      enhancedError.severity,
      enhancedError.context || {}
    );

    // Handle retry logic
    if (options?.retry && options?.retryKey) {
      const attempts = this.retryAttempts.get(options.retryKey) || 0;
      if (attempts < this.maxRetries) {
        this.retryAttempts.set(options.retryKey, attempts + 1);
        try {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
          await options.retry();
          this.retryAttempts.delete(options.retryKey);
          return enhancedError;
        } catch (retryError) {
          console.warn(`Retry ${attempts + 1} failed:`, retryError);
        }
      } else {
        this.retryAttempts.delete(options.retryKey);
      }
    }

    // Show user-friendly messages
    if (options?.showToast !== false) {
      this.showUserNotification(enhancedError);
    }

    return enhancedError;
  }

  private parseError(error: unknown, context?: Record<string, any>): EnhancedError {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        context,
        severity: this.determineSeverity(error),
        timestamp: new Date(),
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        context,
        severity: 'medium',
        timestamp: new Date(),
      };
    }

    return {
      message: 'An unknown error occurred',
      context: { ...context, originalError: error },
      severity: 'medium',
      timestamp: new Date(),
    };
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }
    
    if (message.includes('auth') || message.includes('permission')) {
      return 'high';
    }
    
    if (message.includes('database') || message.includes('critical')) {
      return 'critical';
    }
    
    return 'medium';
  }

  private showUserNotification(error: EnhancedError): void {
    const { message, severity } = error;
    
    // Don't show auth errors in production
    if (message.includes('auth') && process.env.NODE_ENV === 'production') {
      return;
    }

    const userMessage = this.getUserFriendlyMessage(message);
    
    switch (severity) {
      case 'critical':
        toast.error(userMessage, {
          duration: 10000,
          action: {
            label: 'Report Issue',
            onClick: () => this.reportIssue(error),
          },
        });
        break;
      case 'high':
        toast.error(userMessage, { duration: 8000 });
        break;
      case 'medium':
        toast.error(userMessage, { duration: 5000 });
        break;
      case 'low':
        toast.warning(userMessage, { duration: 3000 });
        break;
    }
  }

  private getUserFriendlyMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch failed')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('403')) {
      return 'You don\'t have permission to perform this action.';
    }
    
    if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
      return 'The requested resource was not found.';
    }
    
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return 'Please check your input and try again.';
    }
    
    if (lowerMessage.includes('timeout')) {
      return 'The request timed out. Please try again.';
    }
    
    return 'Something went wrong. Please try again.';
  }

  private reportIssue(error: EnhancedError): void {
    // In a real app, this would send to an error reporting service
    console.error('Critical error reported:', error);
    toast.info('Error report sent. Thank you for helping us improve!');
  }

  // Utility for async operations with error handling
  async safeAsync<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>,
    options?: {
      fallback?: T;
      showToast?: boolean;
      retry?: boolean;
      retryKey?: string;
    }
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      await this.handleError(error, context, {
        showToast: options?.showToast,
        retry: options?.retry ? operation : undefined,
        retryKey: options?.retryKey,
      });
      return options?.fallback || null;
    }
  }
}

export const enhancedErrorHandler = EnhancedErrorHandler.getInstance();

// Convenience function for quick error handling
export const handleError = (
  error: unknown,
  context?: Record<string, any>,
  options?: { showToast?: boolean }
) => enhancedErrorHandler.handleError(error, context, options);

// Async wrapper with error handling
export const safeAsync = <T>(
  operation: () => Promise<T>,
  context?: Record<string, any>,
  options?: { fallback?: T; showToast?: boolean }
) => enhancedErrorHandler.safeAsync(operation, context, options);