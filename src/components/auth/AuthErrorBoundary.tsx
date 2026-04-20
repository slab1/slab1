
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthErrorBoundaryProps {
  error: string | null;
  onRetry?: () => void;
  showHomeButton?: boolean;
  title?: string;
  children?: React.ReactNode;
}

export const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({
  error,
  onRetry,
  showHomeButton = true,
  title = "Authentication Error",
  children
}) => {
  const navigate = useNavigate();

  if (!error) {
    return <>{children}</>;
  }

  const getErrorType = (error: string) => {
    if (error.includes('expired') || error.includes('invalid')) {
      return 'token';
    }
    if (error.includes('session') || error.includes('unauthorized')) {
      return 'session';
    }
    if (error.includes('network') || error.includes('fetch')) {
      return 'network';
    }
    if (error.includes('reset')) {
      return 'reset';
    }
    return 'general';
  };

  const getErrorSuggestion = (errorType: string) => {
    switch (errorType) {
      case 'token':
        return 'The link may have expired or been used already. Please request a new password reset email.';
      case 'session':
        return 'Your session has expired. Please log in again.';
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'reset':
        return 'There was an issue with the password reset process. Please request a new reset link.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  };

  const errorType = getErrorType(error);
  const suggestion = getErrorSuggestion(errorType);

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{error}</p>
        <p className="text-sm text-muted-foreground">{suggestion}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}
          {(errorType === 'token' || errorType === 'reset') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/forgot-password')}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Request New Link
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
