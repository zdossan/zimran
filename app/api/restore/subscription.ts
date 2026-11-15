// SERVER ONLY. Shared by the restore-access routes: does this email have an active Stripe subscription?
import type Stripe from "stripe";

export type ActiveSubscription = { customerId: string; plan: "monthly" | "annual" };

const ACTIVE = new Set(["active", "trialing"]);
// Same shape check as a browser <input type="email">: something@something.tld, no spaces, ≤ 254 chars.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lower-cased, trimmed email, or null if it isn't one. */
export function normalizeEmail(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const email = v.trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : null;
}

export async function findActiveSubscription(stripe: Stripe, email: string): Promise<ActiveSubscription | null> {
  const customers = await stripe.customers.list({ email, limit: 10 });
  for (const customer of customers.data) {
    const subs = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 10 });
    const sub = subs.data.find((s) => ACTIVE.has(s.status));
    if (sub) {
      const priceId = sub.items.data[0]?.price.id;
      return { customerId: customer.id, plan: priceId && priceId === process.env.STRIPE_PRICE_ANNUAL ? "annual" : "monthly" };
    }
  }
  return null;
}
