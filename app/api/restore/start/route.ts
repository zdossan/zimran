// Restore access, step 1: "enter the email you paid with". If Stripe has an active subscription for it,
// Supabase Auth emails a 6-digit code. Every valid email gets the same answer, so this can't be used to
// find out who has subscribed, and non-payers never receive an email.
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServiceClient } from "@/lib/supabase/server";
import { findActiveSubscription, normalizeEmail } from "@/app/api/restore/subscription";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: unknown } | null;
  const email = normalizeEmail(body?.email);
  if (!email) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

  const stripe = getStripe();
  if (!stripe || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ configured: false });
  }

  try {
    if (await findActiveSubscription(stripe, email)) {
      const { error } = await getServiceClient().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      // Logged, not returned: an error here only happens for payers, so showing it would reveal who paid.
      if (error) console.error("restore/start: sending the code failed", error.message);
    }
  } catch (err) {
    console.error("restore/start: lookup failed", err instanceof Error ? err.message : err);
  }
  return NextResponse.json({ ok: true });
}
