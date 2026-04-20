import React, { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Default test publishable key - in production this should be in .env
const DEFAULT_STRIPE_KEY = 'pk_test_51PXXXXXXXXXXXX'; // Placeholder test key
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || DEFAULT_STRIPE_KEY;

// Only attempt to load Stripe if we have a real-looking key (not the placeholder)
const isPlaceholder = stripeKey === DEFAULT_STRIPE_KEY || !stripeKey.startsWith('pk_');
const stripePromise = isPlaceholder ? null : loadStripe(stripeKey);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  // If no Stripe key is provided, we can still render children but payment features will be disabled
  if (!stripePromise) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
