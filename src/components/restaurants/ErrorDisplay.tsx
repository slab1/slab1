
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home, Phone, Database } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
  showContactSupport?: boolean;
  isConnectionError?: boolean;
}

export function ErrorDisplay({ 
  message = "Unable to load restaurants", 
  onRetry,
  showContactSupport = true,
  isConnectionError = false
}: ErrorDisplayProps) {
  const getErrorIcon = () => {
    if (isConnectionError) {
      return <Database className="h-6 w-6 text-destructive" />;
    }
    return <AlertCircle className="h-6 w-6 text-destructive" />;
  };

  const getErrorTitle = () => {
    if (isConnectionError) {
      return "Connection Issue";
    }
    return "Something went wrong";
  };

  const getErrorMessage = () => {
    if (isConnectionError) {
      return "Unable to connect to the database. This might be due to missing configuration or network issues.";
    }
    return message;
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            {getErrorIcon()}
          </div>
          <CardTitle>{getErrorTitle()}</CardTitle>
          <CardDescription>{getErrorMessage()}</CardDescription>
          
          {isConnectionError && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">For Developers:</h4>
              <p className="text-blue-700 text-xs">
                Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are properly set in your deployment configuration.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry} className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button variant="outline" asChild className="inline-flex items-center gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
          
          {showContactSupport && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Still having trouble?
              </p>
              <Button variant="link" size="sm" asChild className="inline-flex items-center gap-1">
                <Link to="/contact">
                  <Phone className="h-3 w-3" />
                  Contact Support
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
