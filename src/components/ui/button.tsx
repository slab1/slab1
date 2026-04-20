
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    // Combine disabled with isLoading
    const isDisabled = disabled || isLoading;
    
    if (asChild) {
      // When using asChild, we need to ensure we're still passing only a single child
      // This means we need to clone the child and add the loader to it
      const child = React.Children.only(children as React.ReactElement);
      
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-busy={isLoading}
          {...props}
        >
          {React.cloneElement(child, {
            ...child.props,
            // We pass the disabled state to the child element instead of the slot
            disabled: isDisabled,
            children: (
              <>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {child.props.children}
              </>
            ),
          })}
        </Slot>
      )
    }
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
// eslint-disable-next-line react-refresh/only-export-components
export { buttonVariants }
