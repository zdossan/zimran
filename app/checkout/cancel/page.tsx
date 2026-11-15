// Owned by P4 (plans/04-pay-trust-pitch.md, Task 3: checkout).
// Stripe's cancel_url (set in app/api/checkout/route.ts). Reached when the user closes the
// Stripe tab or presses Back — nothing was charged, nothing is unlocked.
import Link from "next/link";
import { Card } from "@/components/brand/kit";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Card className="space-y-2">
        <p className="text-lg font-semibold">
          Payment cancelled — nothing was charged.
        </p>
        <p className="text-sm text-muted-foreground">
          Nothing was unlocked. You can try checkout again anytime, or keep
          using our free tools.
        </p>
        <Link href="/results" className="text-sm underline">
          Back to results
        </Link>
      </Card>
    </div>
  );
}
