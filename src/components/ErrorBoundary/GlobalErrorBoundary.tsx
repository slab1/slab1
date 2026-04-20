
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { errorTracker } from "@/utils/error-tracking";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: string | number;
  level?: 'page' | 'component' | 'global';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error details
    console.error(`[ErrorBoundary] ${this.props.level || 'component'} error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      retryCount: this.retryCount
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Track error in error tracker
    errorTracker.captureError(error, 'error', {
      context: `error_boundary_${this.props.level || 'component'}`,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      retryCount: this.retryCount
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.resetError();
    }
  }

  resetError = () => {
    this.retryCount++;
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: ''
    });
  };

  reloadPage = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { level = 'component' } = this.props;

    if (hasError) {
      if (this.props.fallback) return this.props.fallback;

      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>
                {level === 'global' ? 'Application Error' : 'Something went wrong'}
              </CardTitle>
              <CardDescription>
                {level === 'global' 
                  ? 'The application encountered an unexpected error.'
                  : 'This section encountered an unexpected error.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && error && (
                <div className="bg-muted p-4 rounded text-left text-sm overflow-auto max-h-40">
                  <strong className="text-destructive">{error.toString()}</strong>
                  {errorInfo?.componentStack && (
                    <pre className="whitespace-pre-wrap mt-2 text-xs">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button onClick={this.resetError} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </Button>
                )}
                
                {level === 'global' && (
                  <Button onClick={this.reloadPage} variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                )}
                
                <Button variant="outline" asChild className="w-full">
                  <a href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </a>
                </Button>
              </div>

              {!canRetry && (
                <p className="text-sm text-muted-foreground text-center">
                  Error ID: {this.state.errorId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
