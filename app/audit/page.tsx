import type { Metadata } from "next";
import { AuditView } from "@/components/audit/AuditView";
import { Badge } from "@/components/brand/kit";

export const metadata: Metadata = {
  title: "Check a statement — Owen",
  description: "Upload your student-loan servicer statement. We check it against the RAP rules and flag possible errors.",
};

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-3xl">
        <Badge tone="primary">Free statement check</Badge>
        <h1 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">Check your servicer statement for errors</h1>
        <p className="mt-4 text-lg text-slate-600">
          We read your statement, then check it against the federal Repayment Assistance Plan rules: the interest subsidy, the $50 principal
          match, the plan you&apos;re on, and when the bill was sent.
        </p>
      </header>
      <AuditView />
    </div>
  );
}
