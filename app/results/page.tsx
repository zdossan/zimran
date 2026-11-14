import type { Metadata } from "next";
import { ResultsScreen } from "@/components/funnel/ResultsScreen";

export const metadata: Metadata = {
  title: "Your repayment plans — Student Loan Guardian",
  description: "Every federal repayment plan you qualify for, the one we recommend and why, with the rule behind each number.",
};

export default function ResultsPage() {
  return (
    <div>
      {/* No spacing utilities here: the band inside ResultsScreen must sit flush under the header. */}
      <h1 className="sr-only">Your repayment plans</h1>
      <ResultsScreen />
    </div>
  );
}
