import type { Metadata } from "next";
import { AuditView } from "@/components/audit/AuditView";

export const metadata: Metadata = {
  title: "Check a statement — Student Loan Guardian",
  description: "Upload your student-loan servicer statement. We check it against the RAP rules and flag possible errors.",
};

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Check your servicer statement for errors</h1>
        <p className="text-muted-foreground">
          We read your statement, then check it against the federal Repayment Assistance Plan rules: the interest subsidy,
          the $50 principal match, the plan you&apos;re on, and when the bill was sent.
        </p>
      </header>
      <AuditView />
    </div>
  );
}
