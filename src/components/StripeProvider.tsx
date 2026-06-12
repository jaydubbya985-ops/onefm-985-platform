import type { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Stripe backend integration required — connect to your Stripe account and backend API
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: ReturnType<typeof loadStripe> | null = null;
if (STRIPE_PUBLISHABLE_KEY) {
  stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
}

export function StripeProvider({ children }: { children: ReactNode }) {
  if (!stripePromise) {
    return <>{children}</>;
  }
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
