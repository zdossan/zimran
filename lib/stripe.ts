// Stripe SDK wrapper — owned by P4 (plans/04-pay-trust-pitch.md).
// SERVER ONLY: wraps STRIPE_SECRET_KEY. Returns null when unset so route handlers can respond
// with `{ configured: false }` instead of crashing (no keys in CI/dev-without-secrets).
import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}
