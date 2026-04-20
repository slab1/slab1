import React, { lazy, ComponentType } from 'react';
import { AsyncBoundary } from './AsyncBoundary';

interface LazyComponentProps {
  factory: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

export function LazyComponent({ factory, fallback, ...props }: LazyComponentProps) {
  const Component = lazy(factory);
  
  return (
    <AsyncBoundary fallback={fallback}>
      <Component {...props} />
    </AsyncBoundary>
  );
}

// Helper function to create lazy components with consistent error handling
// eslint-disable-next-line react-refresh/only-export-components
export function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <LazyComponent factory={factory} fallback={fallback} {...props} ref={ref} />
  ));
}