
import { cn } from "@/lib/utils";

interface FocusOutlineProps {
  children: React.ReactNode;
  className?: string;
}

export function FocusOutline({ children, className }: FocusOutlineProps) {
  return (
    <div
      className={cn(
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-md",
        className
      )}
    >
      {children}
    </div>
  );
}
