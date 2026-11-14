// Owned by P4 (plans/04-pay-trust-pitch.md, Task 3: checkout).
// Starts a Stripe subscription Checkout Session for the signed-in user. Resolves the user via
// the Authorization bearer token (this stack has no server-side session — see lib/supabase/client.ts)
// and never trusts a client-supplied user id.
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { resolveUserId } from "@/lib/supabase/server";
import { isPaidStateBlocked } from "@/lib/supabase/entitlement";

type Plan = "monthly" | "annual";

export async function POST(req: Request) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { plan?: Plan; state?: string } | null;
  const plan = body?.plan;
  const state = body?.state;

  if (state && isPaidStateBlocked(state)) {
    return NextResponse.json({ error: "state_blocked" }, { status: 403 });
  }

  const stripe = getStripe();
  const priceId = plan === "annual" ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_MONTHLY;
  if (!stripe || !priceId) {
    return NextResponse.json({ configured: false });
  }

  const origin = new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    // Plan isn't derivable from a bare Checkout Session at confirm time, so it rides along in
    // metadata for /api/checkout/confirm to read back into the entitlements upsert.
    metadata: { plan: plan ?? "monthly" },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
