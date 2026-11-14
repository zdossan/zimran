// Owned by P4 (plans/04-pay-trust-pitch.md, Task 3: checkout).
// Stripe's success_url (set in app/api/checkout/route.ts). A server component so session_id
// comes in via the awaited searchParams prop (keeping the route dynamically rendered without a
// Suspense boundary — see CheckoutSuccessClient.tsx for why useSearchParams() itself isn't
// used here); the actual confirm call and the "Manage subscription" button live in the client
// child, since this stack's Supabase session only exists in the browser.
import { CheckoutSuccessClient } from "./CheckoutSuccessClient";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  return <CheckoutSuccessClient sessionId={params.session_id ?? null} />;
}
