import type { Metadata } from "next";
import { ResultsScreen } from "@/components/funnel/ResultsScreen";

export const metadata: Metadata = {
  title: "Your repayment plans — Student Loan Guardian",
  description: "Every federal repayment plan you qualify for, the one we recommend and why, with the rule behind each number.",
};

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your repayment plans</h1>
      <ResultsScreen />
    </div>
  );
}
