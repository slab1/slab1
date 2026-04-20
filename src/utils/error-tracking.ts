// Centralized error tracking utility
import { toast } from 'sonner';

export interface ErrorContext {
  userId?: string;
  action?: string;
  timestamp?: string;
  showToast?: boolean;
  [key: string]: any;
}

class ErrorTracker {
  private errors: Array<{error: Error; context?: ErrorContext; timestamp: number}> = [];
  
  trackError(error: Error, context?: ErrorContext): void {
    this.captureError(error, context);
  }

  captureError(error: Error | string, contextOrMessage?: ErrorContext | string, additionalInfo?: any): void {
    const err = typeof error === 'string' ? new Error(error) : error;
    const context: ErrorContext = typeof contextOrMessage === 'string' 
      ? { message: contextOrMessage, ...additionalInfo }
      : { ...contextOrMessage, ...additionalInfo };
    
    this.errors.push({
      error: err,
      context,
      timestamp: Date.now()
    });

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Tracked]', {
        message: err.message,
        stack: err.stack,
        context,
        timestamp: new Date().toISOString()
      });
    }

    // Show user-friendly toast if not disabled
    if (context.showToast !== false) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    }

    // In production, send to external service
    if (!import.meta.env.DEV) {
      this.sendToExternalService(err, context);
    }
  }

  private sendToExternalService(error: Error, context?: ErrorContext): void {
    // Placeholder for external error tracking integration
    console.log('Error logged to external service:', error.message);
  }

  getErrorStats() {
    const now = Date.now();
    const last24HoursErrors = this.errors.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
    const lastHourErrors = this.errors.filter(e => now - e.timestamp < 60 * 60 * 1000);
    
    // Count by severity (assume all tracked errors are medium severity for now)
    const criticalCount = 0;
    const highCount = 0;
    const mediumCount = last24HoursErrors.length;
    const lowCount = 0;
    
    return {
      total: last24HoursErrors.length,
      last24Hours: last24HoursErrors.length,
      lastHour: lastHourErrors.length,
      byType: this.groupBy(last24HoursErrors, e => e.error.name),
      totalErrors: last24HoursErrors.length,
      criticalCount,
      unresolvedCount: last24HoursErrors.length,
      recentErrors: last24HoursErrors.map(e => ({
        message: e.error.message,
        level: 'error' as const,
        timestamp: e.timestamp
      })),
      bySeverity: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount
      },
      errorsByLevel: {
        error: last24HoursErrors.length,
        warning: 0,
        info: 0
      }
    };
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  logApiError(endpoint: string, error: any, context?: ErrorContext): void {
    const apiError = new Error(`API Error: ${endpoint} - ${error.message || error}`);
    this.trackError(apiError, {
      ...context,
      endpoint,
      errorType: 'API_ERROR'
    });
  }

  captureApiError(endpoint: string, method: string, statusCode: number, responseText: string): void {
    const apiError = new Error(`API Error: ${method} ${endpoint} - Status ${statusCode}`);
    this.trackError(apiError, {
      endpoint,
      method,
      statusCode,
      responseText,
      errorType: 'API_ERROR'
    });
  }
}

export const errorTracker = new ErrorTracker();
export default errorTracker;
