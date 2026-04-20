
import React from 'react';

export const AuthLoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-in fade-in duration-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};
