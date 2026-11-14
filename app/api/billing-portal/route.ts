// Owned by P4 (plans/04-pay-trust-pitch.md, Task 3: billing portal).
// Spec §5.6: "Manage subscription" must reach Stripe's customer billing portal. Resolves the
// user via the bearer token, looks up their stripe_customer_id server-side (service role, RLS
// doesn't apply), and opens a portal session back to /results.
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServiceClient, resolveUserId } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ configured: false });
  }

  const { data, error } = await getServiceClient()
    .from("entitlements")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const customerId = !error && data ? (data as { stripe_customer_id?: string | null }).stripe_customer_id : null;
  if (!customerId) {
    return NextResponse.json({ error: "no_subscription" }, { status: 404 });
  }

  const origin = new URL(req.url).origin;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/results`,
  });

  return NextResponse.json({ url: session.url });
}
