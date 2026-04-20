
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedLoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  overlay?: boolean;
  variant?: "default" | "dots" | "pulse";
}

export function EnhancedLoadingSpinner({ 
  size = "md", 
  className, 
  text,
  overlay = false,
  variant = "default"
}: EnhancedLoadingSpinnerProps) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-primary animate-bounce",
                  {
                    xs: "h-1 w-1",
                    sm: "h-1.5 w-1.5",
                    md: "h-2 w-2",
                    lg: "h-3 w-3",
                    xl: "h-4 w-4"
                  }[size]
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        );
      case "pulse":
        return (
          <div className={cn(
            "rounded-full bg-primary animate-pulse",
            sizeClasses[size]
          )} />
        );
      default:
        return (
          <Loader className={cn(
            "animate-spin text-primary",
            sizeClasses[size]
          )} />
        );
    }
  };

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      overlay && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
      !overlay && "p-4",
      className
    )}>
      {renderSpinner()}
      {text && (
        <p className={cn(
          "text-muted-foreground font-medium",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  return content;
}
