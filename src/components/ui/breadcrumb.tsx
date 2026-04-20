
import * as React from "react";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Link } from "react-router-dom";

interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode;
  truncationLength?: number;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    { children, separator = <ChevronRight className="h-4 w-4" />, className, truncationLength, ...props },
    ref
  ) => {
    const childCount = React.Children.count(children);
    const shouldTruncate = truncationLength && childCount > truncationLength;

    // Render visible children
    let visibleChildren: React.ReactNode[] = [];
    
    if (shouldTruncate) {
      // For truncation, take the first and last items
      const firstItem = React.Children.toArray(children)[0];
      const lastItems = React.Children.toArray(children).slice(-truncationLength + 1);
      
      visibleChildren = [
        firstItem,
        <BreadcrumbEllipsis key="ellipsis" />,
        ...lastItems
      ];
    } else {
      visibleChildren = React.Children.toArray(children);
    }

    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex flex-wrap items-center", className)}
        {...props}
      >
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2.5">
          {visibleChildren.map((child, index) => {
            return (
              <li key={index} className="inline-flex items-center">
                {child}
                {index < visibleChildren.length - 1 && (
                  <span className="mx-1.5 sm:mx-2.5 text-muted-foreground">
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : Link;
  
  return (
    <Comp
      ref={ref}
      className={cn("transition-colors text-sm font-medium hover:text-foreground", className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-current="page"
    aria-disabled="true"
    className={cn("text-sm font-medium text-foreground", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    className={cn("mx-2 text-muted-foreground", className)}
    {...props}
  >
    {children || <ChevronRight className="h-4 w-4" />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex items-center justify-center text-muted-foreground", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
