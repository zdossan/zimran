import type { Metadata } from "next";
import { AuditView } from "@/components/audit/AuditView";
import { Band } from "@/components/brand/Band";

export const metadata: Metadata = {
  title: "Check a statement — Student Loan Guardian",
  description: "Upload your student-loan servicer statement. We check it against the RAP rules and flag possible errors.",
};

export default function AuditPage() {
  return (
    <div>
      {/* The band must be the first element so it sits flush under the header. */}
      <Band>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Check your servicer statement for errors</h1>
        <p className="mt-3 max-w-2xl text-white/85">
          We read your statement, then check it against the federal Repayment Assistance Plan rules: the interest subsidy,
          the $50 principal match, the plan you&apos;re on, and when the bill was sent.
        </p>
      </Band>
      <AuditView />
    </div>
  );
}
