import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        'Missing STRIPE_SECRET_KEY environment variable. ' +
        'Set it in .env.local (dev) or your hosting dashboard (prod).'
      );
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const PRICE_ID_YEARLY =
  process.env.STRIPE_PRICE_ID_YEARLY || process.env.STRIPE_PRICE_ID || '';
export const PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY || '';
