import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "default" | "destructive";
}

export function ErrorDisplay({ 
  title = "Error", 
  message, 
  onRetry,
  variant = "destructive" 
}: ErrorDisplayProps) {
  return (
    <Alert variant={variant} className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-2 ml-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}