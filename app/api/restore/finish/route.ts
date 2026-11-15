// Restore access, step 2. The browser has just verified the emailed code with Supabase (verifyOtp), so its
// bearer token now belongs to a user with a verified email. If Stripe still has an active subscription for
// that email, unlock this user. Never trusts a client-supplied email or user id.
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServiceClient } from "@/lib/supabase/server";
import { findActiveSubscription, normalizeEmail } from "@/app/api/restore/subscription";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ configured: false });

  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const email = normalizeEmail(data.user.email);
  if (!email || !data.user.email_confirmed_at) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

  const sub = await findActiveSubscription(stripe, email);
  if (!sub) return NextResponse.json({ error: "no_active_subscription" }, { status: 403 });

  const { error: upsertError } = await supabase
    .from("entitlements")
    .upsert({ user_id: data.user.id, pro: true, plan: sub.plan, stripe_customer_id: sub.customerId }, { onConflict: "user_id" });
  if (upsertError) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({ pro: true });
}
