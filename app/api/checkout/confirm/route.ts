// Owned by P4 (plans/04-pay-trust-pitch.md, Task 3: checkout confirm).
// Called client-side from app/checkout/success/page.tsx right after Stripe redirects back
// (this stack has no server-side session, so the browser is the only place session_id + the
// bearer token are both available — see lib/supabase/client.ts). Verifies the Checkout Session
// actually completed and belongs to the resolved user, then writes the entitlement server-side
// with the service-role key.
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServiceClient } from "@/lib/supabase/server";

async function resolveUserId(req: Request): Promise<string | null> {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await getServiceClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function POST(req: Request) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { session_id?: string } | null;
  const sessionId = body?.session_id;
  if (!sessionId) {
    return NextResponse.json({ error: "missing_session_id" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ configured: false });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.status !== "complete" || session.client_reference_id !== userId) {
    return NextResponse.json({ error: "session_not_confirmed" }, { status: 403 });
  }

  const plan = session.metadata?.plan === "annual" ? "annual" : "monthly";
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const { error: upsertError } = await getServiceClient()
    .from("entitlements")
    .upsert(
      {
        user_id: userId,
        pro: true,
        plan,
        stripe_customer_id: stripeCustomerId,
        stripe_session_id: session.id,
      },
      { onConflict: "stripe_session_id" },
    );

  if (upsertError) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ pro: true });
}
