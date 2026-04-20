import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorTracker } from "@/utils/error-tracking";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to external service via centralized tracker
    errorTracker.captureError(error, {
      componentStack: errorInfo.componentStack,
      context: 'ErrorBoundary'
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred while loading this section.
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <div className="bg-muted p-4 rounded text-left w-full max-w-xl mb-4 overflow-auto max-h-60 text-sm">
              <strong>{error.toString()}</strong>
              <pre className="whitespace-pre-wrap mt-2">
                {errorInfo?.componentStack}
              </pre>
            </div>
          )}

          <Button onClick={this.resetError}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
