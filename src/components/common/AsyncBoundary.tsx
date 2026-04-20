import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AsyncBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function AsyncBoundary({ 
  children, 
  fallback,
  errorFallback 
}: AsyncBoundaryProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner />
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}